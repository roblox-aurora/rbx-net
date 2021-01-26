import { getGlobalRemote as getGlobalRemoteId } from "../internal";
import ClientEvent from "./ClientEvent";

/**
 * Client counter-part to GlobalServerEvent
 */
export default class ClientGameEvent<TArgs extends unknown[] = unknown[]> {
	private readonly instance: ClientEvent<TArgs>;
	constructor(name: string) {
		this.instance = new ClientEvent(getGlobalRemoteId(name));
	}

	/**
	 * Connect a function to fire when the event is invoked by the client
	 * @param callback The function fired when the event is invoked by the client
	 */
	public Connect(callback: (...args: TArgs) => void) {
		this.instance.Connect(callback);
	}
}
