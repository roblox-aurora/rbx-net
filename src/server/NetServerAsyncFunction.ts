import { Middleware } from "../middleware";
import { DebugLog, DebugWarn } from "../configuration";
import { findOrCreateRemote, IAsyncListener, IS_CLIENT } from "../internal";
import NetMiddlewareEvent, { MiddlewareList } from "./NetMiddlewareEventHandler";
import { MiddlewareOverload } from "../helpers/EventConstructor";
const HttpService = game.GetService("HttpService");

type AsyncEventArgs = [eventId: string, data: unknown];

function isEventArgs(value: unknown[]): value is AsyncEventArgs {
	if (value.size() < 2) return false;
	const [eventId, data] = value;
	return typeIs(eventId, "string") && typeIs(data, "table");
}

class NetServerAsyncFunction<CallArguments extends Array<unknown>> extends NetMiddlewareEvent {
	private instance: RemoteEvent<Callback>;
	private timeout = 10;
	private connector: RBXScriptConnection | undefined;
	private listeners = new Map<string, IAsyncListener>();

	public GetInstance() {
		return this.instance;
	}

	constructor(name: string);
	constructor(name: string, middlewares: MiddlewareOverload<CallArguments>);
	constructor(name: string, middlewares: MiddlewareList = []) {
		super(middlewares);
		this.instance = findOrCreateRemote("AsyncRemoteFunction", name);
		assert(!IS_CLIENT, "Cannot create a NetServerAsyncFunction on the client!");
	}

	public SetCallback<R>(callback: (player: Player, ...args: CallArguments) => R) {
		if (this.connector) {
			this.connector.Disconnect();
			this.connector = undefined;
		}

		this.connector = this.instance.OnServerEvent.Connect(async (player, ...args: Array<unknown>) => {
			if (isEventArgs(args)) {
				const [eventId, data] = args;

				const result: unknown | Promise<unknown> = this._processMiddleware<CallArguments, R>(callback)?.(
					player,
					...(data as CallArguments),
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
					if (result === undefined) {
						warn("[rbx-net-async] " + this.instance.Name + " returned undefined");
					}
					this.instance.FireClient(player, eventId, result);
				}
			} else {
				warn("[rbx-net-async] Recieved message without eventId");
			}
		});
	}

	public async CallPlayerAsync(player: Player, ...args: Array<unknown>): Promise<unknown> {
		const id = HttpService.GenerateGUID(false);
		this.instance.FireClient(player, id, { ...args });

		return new Promise((resolve, reject) => {
			const startTime = tick();
			DebugLog("Connected CallPlayerAsync EventId", id);
			const connection = this.instance.OnServerEvent.Connect(
				(fromPlayer: Player, ...recvArgs: Array<unknown>) => {
					const [eventId, data] = recvArgs;

					if (typeIs(eventId, "string") && data !== undefined) {
						if (player === player && eventId === id) {
							DebugLog("Disconnected CallPlayerAsync EventId", eventId);
							connection.Disconnect();
							resolve(data);
						}
					}
				},
			);
			this.listeners.set(id, { connection, timeout: this.timeout });

			do {
				game.GetService("RunService").Stepped.Wait();
			} while (connection.Connected && tick() < startTime + this.timeout);

			this.listeners.delete(id);

			if (tick() >= startTime && connection.Connected) {
				DebugWarn("(timeout) Disconnected CallPlayerAsync EventId", id);
				connection.Disconnect();
				reject("Request to client timed out");
			}
		});
	}
}

export default NetServerAsyncFunction;
