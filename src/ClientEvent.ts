import { getRemoteOrThrow, IS_CLIENT, waitForEvent, MAX_CLIENT_WAITFORCHILD_TIMEOUT } from "internal";

/**
 * An event on the client
 * @rbxts client
 */
export default class NetClientEvent implements IClientNetEvent {
	/** @internal */
	private instance: RemoteEvent;

	/**
	 * Create a new instance of the ClientEvent
	 * @param name The name of the client event
	 * @throws If created on server, or does not exist.
	 */
	constructor(name: string) {
		this.instance = getRemoteOrThrow("RemoteEvent", name);
		assert(IS_CLIENT, "Cannot create a Net.ClientEvent on the Server!");
	}

	public static async WaitFor(name: string): Promise<NetClientEvent> {
		const fun: RemoteEvent | undefined = waitForEvent(name, MAX_CLIENT_WAITFORCHILD_TIMEOUT);
		if (!fun) {
			error("Failed to retrieve client Event!");
		}

		return new NetClientEvent(name);
	}

	/**
	 * The RemoteEvent instance
	 */
	public get Instance() {
		return this.instance;
	}

	/**
	 * The RBXScriptConnection
	 */
	public get Event() {
		return this.instance.OnClientEvent;
	}

	/**
	 * Connect a function to fire when the event is invoked by the client
	 * @param callback The function fired when the event is invoked by the client
	 */
	public Connect<T extends Array<any>>(callback: (...args: T) => void) {
		this.Event.Connect(callback as Callback);
	}

	/**
	 * Sends the specified arguments to the server
	 * @param args The arguments to send to the server
	 */
	public SendToServer<T extends Array<any>>(...args: T) {
		this.instance.FireServer(...args);
	}
}