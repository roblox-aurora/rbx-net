import { findOrCreateRemote, IS_CLIENT, IAsyncListener, t_assert, StaticArguments } from "./internal";
import { DebugLog, DebugWarn } from "./configuration";

const HttpService = game.GetService("HttpService");

/**
 * An event that behaves like a function
 * @rbxts server
 */
export default class NetServerAsyncFunction<C extends Array<any> = Array<unknown>> {
	private instance: RemoteEvent;
	private timeout = 10;
	private listeners = new Map<string, IAsyncListener>();
	private connector: RBXScriptConnection | undefined;
	protected propTypes: C | undefined;

	constructor(name: string, ...recievedPropTypes: C) {
		this.instance = findOrCreateRemote("AsyncRemoteFunction", name);
		assert(!IS_CLIENT, "Cannot create a Net.ServerAsyncFunction on the Client!");

		if (recievedPropTypes.size() > 0) {
			this.propTypes = recievedPropTypes;
		}
	}

	public GetCallTimeout() {
		return this.timeout;
	}

	public SetCallTimeout(timeout: number) {
		assert(timeout > 0, "timeout must be a positive number");
		this.timeout = timeout;
	}

	public SetCallback(callback: (player: Player, ...args: StaticArguments<C>) => any) {
		if (this.connector) {
			this.connector.Disconnect();
			this.connector = undefined;
		}

		this.connector = this.instance.OnServerEvent.Connect(async (player, ...args: Array<unknown>) => {
			const [eventId, data] = args;

			if (this.propTypes === undefined || t_assert(this.propTypes, args)) {
				if (typeIs(eventId, "string") && typeIs(data, "table")) {
					const result: unknown | Promise<unknown> = callback(player, ...(data as StaticArguments<C>));
					if (Promise.is(result)) {
						result
							.then(promiseResult => {
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
			} else {
				error("Client failed type checks", 2);
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

			Promise.spawn(() => {
				// Wait until disconnected or timeout
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
		});
	}
}
