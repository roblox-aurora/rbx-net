/* eslint-disable no-restricted-syntax */
import { findOrCreateRemote, IAsyncListener, IS_CLIENT, TagId } from "../internal";
import MiddlewareEvent, { MiddlewareList } from "./MiddlewareEvent";
import { MiddlewareOverload, ServerCallbackMiddleware } from "../middleware";
import { DefinitionConfiguration } from "@rbxts/net/out/definitions";
import { NetworkModelConfiguration } from "../definitions";
import { ServerNetworkModelConfiguration } from "../definitions/Classes/ServerRemoteContext";
const CollectionService = game.GetService("CollectionService");

const HttpService = game.GetService("HttpService");
const RunService = game.GetService("RunService");

type AsyncEventArgs = [eventId: string, data: unknown];

function isEventArgs(value: Array<unknown>): value is AsyncEventArgs {
	if (value.size() < 2) return false;
	const [eventId, data] = value;
	return typeIs(eventId, "string") && typeIs(data, "table");
}

export interface ServerAsyncCallback<CallbackArgs extends ReadonlyArray<unknown>, CallbackReturnType> {
	/**
	 * Sets the callback that will be invoked when the client calls this function.
	 *
	 * The returned result will be returned to the client. If the callback is a Promise, it will only return a value if the promise is resolved.
	 *
	 * @param callback The callback
	 */
	SetCallback<R extends CallbackReturnType>(callback: (player: Player, ...args: CallbackArgs) => R): void;
	SetCallback<R extends Promise<CallbackReturnType>>(callback: (player: Player, ...args: CallbackArgs) => R): void;
}

export interface ServerAsyncCaller<CallArgs extends ReadonlyArray<unknown>, CallReturnType> {
	/**
	 * Calls the specified player with the given arguments, and returns the result as a promise.
	 *
	 * ### NOTE: Any values returned from the client should be verified! ensure the result you're given is correct!
	 *
	 * @param player The player to call
	 * @param args The arguments
	 */
	CallPlayerAsync(player: Player, ...args: CallArgs): Promise<CallReturnType>;

	/**
	 * Sets the call timeout for this caller. If the timeout is reached, the promise from the calling function will reject.
	 * @param timeout The timeout (in seconds)
	 */
	SetCallTimeout(timeout: number): this;

	/**
	 * Gets the call timeout (in seconds) that this remote will wait before rejecting if no response is recieved
	 */
	GetCallTimeout(): number;
}

/**
 * An asynchronous function for two way communication between the client and server
 */
class ServerAsyncFunction<
		CallbackArgs extends ReadonlyArray<unknown> = Array<unknown>,
		CallArgs extends ReadonlyArray<unknown> = Array<unknown>,
		CallReturnType = unknown,
		CallbackReturnType = unknown,
	>
	extends MiddlewareEvent
	implements ServerAsyncCallback<CallbackArgs, CallbackReturnType>, ServerAsyncCaller<CallArgs, CallReturnType>
{
	private instance: RemoteEvent<Callback>;
	private timeout = 10;
	private connector: RBXScriptConnection | undefined;
	private listeners = new Map<string, IAsyncListener>();
	private defaultHook?: RBXScriptConnection;

	/** @internal */
	private readonly DefaultEventHook = (player: Player, ...args: Array<unknown>) => {
		this.configuration.OnRecieveFunctionCallWithNoCallback?.(this.instance.Name, player, args);
		return;
	};

	/** @internal */
	public GetInstance() {
		return this.instance;
	}

	public constructor(
		name: string,
		middlewares: Array<ServerCallbackMiddleware> = [],
		private configuration: ServerNetworkModelConfiguration,
	) {
		super(middlewares);
		this.instance = findOrCreateRemote("AsyncRemoteFunction", name, (instance) => {
			// Default connection
			this.defaultHook = instance.OnServerEvent.Connect(this.DefaultEventHook);
			CollectionService.AddTag(instance, TagId.DefaultFunctionListener);
		});
		assert(!IS_CLIENT, "Cannot create a NetServerAsyncFunction on the client!");
	}

	public SetCallTimeout(timeout: number) {
		assert(timeout > 0, "timeout must be a positive number");
		this.timeout = timeout;
		return this;
	}

	public GetCallTimeout() {
		return this.timeout;
	}

	/**
	 * Set the callback for this Async Function
	 * @param callback The callback
	 */
	public SetCallback<R extends CallbackReturnType>(callback: (player: Player, ...args: CallbackArgs) => R) {
		if (this.defaultHook !== undefined) {
			this.defaultHook.Disconnect();
			this.defaultHook = undefined;
			CollectionService.RemoveTag(this.instance, TagId.DefaultFunctionListener);
		}

		if (this.connector) {
			this.connector.Disconnect();
			this.connector = undefined;
		}

		const id = this.instance.Name;
		const microprofile = this.configuration.MicroprofileCallbacks;

		this.connector = this.instance.OnServerEvent.Connect(async (player, ...args: Array<unknown>) => {
			if (microprofile) debug.profilebegin(`NetAsync: ${id}`);

			if (isEventArgs(args)) {
				const [eventId, data] = args;

				const result: unknown | Promise<unknown> = this._processMiddleware<CallbackArgs, R>(callback)?.(
					player,
					...(data as CallbackArgs),
				);
				if (Promise.is(result)) {
					result
						.then((promiseResult) => {
							this.instance.FireClient(player, eventId, promiseResult);
						})
						.catch((err: string) => {
							warn("[rbx-net] Failed to send response to client: " + err);
						});
				} else {
					this.instance.FireClient(player, eventId, result);
				}
			} else {
				warn("[rbx-net-async] Recieved message without eventId");
			}
		});
	}

	/**
	 * Calls the specified player, with the given values
	 * @param player The player to call
	 * @param args The arguments to send to the player
	 * @returns Promise with the result of what's recieved with the player
	 * @throws A rejection if the call times out
	 */
	public async CallPlayerAsync(player: Player, ...args: CallArgs): Promise<CallReturnType> {
		const id = HttpService.GenerateGUID(false);
		this.instance.FireClient(player, id, { ...args });

		return new Promise((resolve, reject) => {
			const startTime = tick();
			const connection = this.instance.OnServerEvent.Connect(
				(fromPlayer: Player, ...recvArgs: Array<unknown>) => {
					const [eventId, data] = recvArgs;

					if (typeIs(eventId, "string") && data !== undefined) {
						if (player === player && eventId === id) {
							connection.Disconnect();
							resolve(data as CallReturnType);
						}
					}
				},
			);
			this.listeners.set(id, { connection, timeout: this.timeout });

			do {
				RunService.Stepped.Wait();
			} while (connection.Connected && tick() < startTime + this.timeout);

			this.listeners.delete(id);

			if (tick() >= startTime && connection.Connected) {
				connection.Disconnect();
				reject("Request to client timed out");
			}
		});
	}
}

export default ServerAsyncFunction;
