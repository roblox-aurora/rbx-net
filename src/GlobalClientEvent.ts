import { getGlobalRemote as getGlobalRemoteId } from "internal";
import NetClientEvent from "ClientEvent";

/**
 * Client counter-part to GlobalServerEvent
 */
export default class NetGlobalClientEvent {
	private readonly instance: NetClientEvent;
	constructor(name: string) {
		this.instance = new NetClientEvent(getGlobalRemoteId(name));
	}

	/**
	 * Connect a function to fire when the event is invoked by the client
	 * @param callback The function fired when the event is invoked by the client
	 */
	public Connect<T extends Array<any>>(callback: (...args: T) => void) {
		this.instance.Connect(callback as Callback);
	}
}
