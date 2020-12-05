import { getGlobalRemote as getGlobalRemoteId } from "../internal";
import ClientEvent from "./ClientEvent";

/**
 * Client counter-part to GlobalServerEvent
 */
export default class CrossServerEvent {
	private readonly instance: ClientEvent;
	constructor(name: string) {
		this.instance = new ClientEvent(getGlobalRemoteId(name));
	}

	/**
	 * Connect a function to fire when the event is invoked by the client
	 * @param callback The function fired when the event is invoked by the client
	 */
	public Connect<T extends Array<any>>(callback: (...args: T) => void) {
		this.instance.Connect(callback as Callback);
	}
}
