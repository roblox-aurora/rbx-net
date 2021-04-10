import { DebugLog, DebugWarn } from "../configuration";
import { IAsyncListener, getRemoteOrThrow, IS_SERVER, waitForRemote } from "../internal";

const HttpService = game.GetService("HttpService");

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
	private instance: RemoteEvent;
	private timeout = 10;
	private connector: RBXScriptConnection | undefined;
	private listeners = new Map<string, IAsyncListener>();

	constructor(name: string) {
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

		this.connector = this.instance.OnClientEvent.Connect(async (...args: CallbackArgs) => {
			const [eventId, data] = args;
			if (typeIs(eventId, "string") && typeIs(data, "table")) {
				const result: unknown | Promise<unknown> = callback(...(data as CallbackArgs));
				if (Promise.is(result)) {
					result
						.then((promiseResult) => {
							this.instance.FireServer(eventId, promiseResult);
						})
						.catch((err: string) => {
							warn("[rbx-net] Failed to send response to server: " + err);
						});
				} else {
					this.instance.FireServer(eventId, result);
				}
			} else {
				warn("Recieved message without eventId");
			}
		});
	}

	public async CallServerAsync(...args: CallArgs): Promise<CallReturnType> {
		const id = HttpService.GenerateGUID(false);
		this.instance.FireServer(id, { ...args });

		return new Promise((resolve, reject) => {
			const startTime = tick();
			DebugLog("Connected CallServerAsync EventId", id);
			const connection = this.instance.OnClientEvent.Connect((...recvArgs: Array<unknown>) => {
				const [eventId, data] = recvArgs;

				if (typeIs(eventId, "string") && data !== undefined) {
					if (eventId === id) {
						DebugLog("Disconnected CallServerAsync EventId", eventId);
						connection.Disconnect();
						resolve(data as CallReturnType);
					}
				}
			});
			this.listeners.set(id, { connection, timeout: this.timeout });

			do {
				game.GetService("RunService").Heartbeat.Wait();
			} while (connection.Connected && tick() < startTime + this.timeout);

			this.listeners.delete(id);

			if (tick() >= startTime && connection.Connected) {
				DebugWarn("(timeout) Disconnected CallServerAsync EventId", id);
				connection.Disconnect();
				reject("Request to server timed out after " + this.timeout + " seconds");
			}
		});
	}
}
