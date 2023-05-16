import { IAsyncListener, getRemoteOrThrow, IS_SERVER, waitForRemote, TagId } from "../internal";
import {
	ServerAsyncListener,
	AsyncSendRequest,
	AsyncSendResponse,
	ClientAsyncListener,
	RequestType,
	ClientAsyncRemoteCallback,
	ServerListenerDelegate,
	ClientListenerDelegate,
} from "../internal/async";

const HttpService = game.GetService("HttpService");
const RunService = game.GetService("RunService");
const CollectionService = game.GetService("CollectionService");

export interface ClientAsyncCallback<CallbackArgs extends readonly unknown[], CallbackReturnType> {
	/**
	 * Sets the callback that will be invoked when the server calls this function.
	 *
	 * The returned result will be returned to the server. If the callback is a Promise, it will only return a value if the promise is resolved.
	 *
	 * @param callback The callback
	 */
	SetCallback<R extends CallbackReturnType>(callback: (...args: CallbackArgs) => R): void;
	SetCallback<R extends Promise<CallbackReturnType>>(callback: (...args: CallbackArgs) => R): void;
}

export interface ClientAsyncCaller<CallArgs extends readonly unknown[], CallReturnType> {
	/**
	 * Calls the server with the given arguments and returns the result from the server as a promise.
	 * @param args The arguments to the function
	 */
	CallServerAsync(...args: CallArgs): Promise<CallReturnType>;

	/**
	 * Sets the call timeout for this caller. If the timeout is reached, the promise from the calling function will reject.
	 * @param timeout The timeout (in seconds)
	 */
	SetCallTimeout(timeout: number): void;

	/**
	 * Gets the call timeout (in seconds) that this remote will wait before rejecting if no response is recieved
	 */
	GetCallTimeout(): number;
}

/**
 * An event that behaves like a function
 * @rbxts client
 */
export default class ClientAsyncFunction<
	CallbackArgs extends ReadonlyArray<unknown> = Array<unknown>,
	CallArgs extends ReadonlyArray<unknown> = Array<unknown>,
	CallReturnType = unknown,
	CallbackReturnType = unknown
> implements ClientAsyncCallback<CallbackArgs, CallbackReturnType>, ClientAsyncCaller<CallArgs, CallReturnType> {
	private instance: RemoteEvent<AsyncSendResponse<CallbackReturnType> | AsyncSendRequest<CallArgs>>;
	private timeout = 60;
	private connector: RBXScriptConnection | undefined;
	private listeners = new Map<string, IAsyncListener>();

	constructor(private name: string) {
		this.instance = getRemoteOrThrow("AsyncRemoteFunction", name);
		assert(!IS_SERVER, "Cannot create a Net.ClientAsyncFunction on the Server!");
	}

	public static Wait<
		CallbackArgs extends ReadonlyArray<unknown> = Array<unknown>,
		CallArgs extends ReadonlyArray<unknown> = Array<unknown>,
		ServerReturnType = unknown
	>(name: string) {
		return Promise.defer<ClientAsyncFunction<CallbackArgs, CallArgs, ServerReturnType>>(async (resolve) => {
			await waitForRemote("AsyncRemoteFunction", name, 60);
			resolve(new ClientAsyncFunction(name));
		});
	}

	public SetCallTimeout(timeout: number) {
		assert(timeout > 0, "timeout must be a positive number");
		this.timeout = timeout;
	}

	public GetCallTimeout() {
		return this.timeout;
	}

	public SetCallback<R extends CallbackReturnType>(callback: (...args: CallbackArgs) => R) {
		if (this.connector) {
			this.connector.Disconnect();
			this.connector = undefined;
		}

		const listener: ClientAsyncListener<CallbackArgs> = (...args) => {
			const [eventId, data] = args;
			if (typeIs(eventId, "string") && typeIs(data, "table")) {
				const result = callback(...data) as CallbackReturnType | Promise<CallbackReturnType>;
				if (Promise.is(result)) {
					result
						.then((promiseResult) => {
							this.instance.FireServer(eventId, RequestType.ClientToServerResponse, {
								type: "Ok",
								value: promiseResult,
							});
						})
						.catch((err: string) => {
							warn("[rbx-net] Failed to send response to server: " + err);
							this.instance.FireServer(eventId, RequestType.ClientToServerResponse, {
								type: "Err",
								err: "Promise in ServerAsyncFunction callback rejected",
							});
						});
				} else {
					this.instance.FireServer(eventId, RequestType.ClientToServerResponse, {
						type: "Ok",
						value: result,
					});
				}
			} else {
				warn("Recieved message without eventId");
			}
		};

		this.connector = this.instance.OnClientEvent.Connect(listener as Callback);
	}

	public async CallServerAsync(...args: CallArgs): Promise<CallReturnType> {
		if (CollectionService.HasTag(this.instance, TagId.DefaultFunctionListener)) {
			throw `Attempted to call AsyncFunction '${this.name}' - which has no user defined callback`;
		}

		const id = HttpService.GenerateGUID(false);
		this.instance.FireServer(id, RequestType.ClientToServerRequest, { ...args });

		return new Promise((resolve, reject) => {
			const startTime = tick();

			const responseDelegate: ClientListenerDelegate<
				Parameters<ClientAsyncRemoteCallback<CallbackArgs, CallReturnType>>
			> = (...args) => {
				const [eventId, reqType, data] = args;

				if (reqType === RequestType.ServerToClientResponse && eventId === id) {
					connection.Disconnect();
					if (data.type === "Ok") {
						resolve(data.value);
					} else {
						reject(data.err);
					}
				}
			};

			const connection = this.instance.OnClientEvent.Connect(responseDelegate as Callback);
			this.listeners.set(id, { connection, timeout: this.timeout });

			let warned = false;
			let elapsedTime = 0;
			do {
				elapsedTime += RunService.Heartbeat.Wait()[0];
				if (elapsedTime >= 20 && !warned) {
					warned = true;
					warn(`[rbx-net] CallServerAsync(...) - still waiting for result from remote '${this.name}'`);
					print(debug.traceback("", 3));
				}
			} while (connection.Connected && tick() < startTime + this.timeout);

			this.listeners.delete(id);

			if (tick() >= startTime && connection.Connected) {
				connection.Disconnect();
				reject("Request to server timed out after " + this.timeout + " seconds");
			}
		});
	}
}
