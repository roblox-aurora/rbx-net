import { IS_SERVER, IAsyncListener, getRemoteOrThrow } from "./internal";
import { DebugLog, DebugWarn } from "./configuration";

const HttpService = game.GetService("HttpService");

/**
 * An event that behaves like a function
 * @rbxts client
 */
export default class NetClientAsyncFunction {
	private instance: RemoteEvent;
	private timeout = 10;
	private connector: RBXScriptConnection | undefined;
	private listeners = new Map<string, IAsyncListener>();

	constructor(name: string) {
		this.instance = getRemoteOrThrow("AsyncRemoteFunction", name);
		assert(!IS_SERVER, "Cannot create a Net.ClientAsyncFunction on the Client!");
	}

	public SetCallTimeout(timeout: number) {
		assert(timeout > 0, "timeout must be a positive number");
		this.timeout = timeout;
	}

	public GetCallTimeout() {
		return this.timeout;
	}

	public SetCallback(callback: (...args: Array<unknown>) => any) {
		if (this.connector) {
			this.connector.Disconnect();
			this.connector = undefined;
		}

		this.connector = this.instance.OnClientEvent.Connect(async (...args: Array<unknown>) => {
			const [eventId, data] = args;
			if (typeIs(eventId, "string") && typeIs(data, "table")) {
				const result: unknown | Promise<unknown> = callback(...data);
				if (Promise.is(result)) {
					result.then(promiseResult => {
						this.instance.FireServer(eventId, [promiseResult]);
					}).catch((err: string) => {
						warn("[rbx-net] Failed to send response to server: " + err);
					});
				} else {
					this.instance.FireServer(eventId, [result]);
				}
			} else {
				warn("Recieved message without eventId");
			}
		});
	}

	public async CallServerAsync(...args: Array<unknown>): Promise<Array<unknown>> {
		const id = HttpService.GenerateGUID(false);
		this.instance.FireServer(id, { ...args });

		return new Promise((resolve, reject) => {
			const startTime = tick();
			DebugLog("Connected CallServerAsync EventId", id);
			const connection = this.instance.OnClientEvent.Connect((...recvArgs: Array<unknown>) => {
				const [eventId, data] = recvArgs;

				if (typeIs(eventId, "string") && typeIs(data, "table")) {
					if (eventId === id) {
						DebugLog("Disconnected CallServerAsync EventId", eventId);
						connection.Disconnect();
						resolve(data);
					}
				}
			});
			this.listeners.set(id, { connection, timeout: this.timeout });

			Promise.spawn(() => {
				// Wait until disconnected or timeout
				do {
					game.GetService("RunService").Stepped.Wait();
				} while (connection.Connected && tick() < startTime + this.timeout);

				this.listeners.delete(id);

				if (tick() >= startTime && connection.Connected) {
					DebugWarn("(timeout) Disconnected CallServerAsync EventId", id);
					connection.Disconnect();
					reject("Request to client timed out");
				}
			});
		});
	}
}
