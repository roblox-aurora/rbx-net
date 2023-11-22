import { DefinitionConfiguration } from "../definitions";
import { getRemoteOrThrow, IS_SERVER, waitForRemote } from "../internal";

/**
 * Interface for client listening events
 */
export interface ClientListenerEvent<CallArguments extends ReadonlyArray<unknown>> {
	/**
	 * Connects a callback function to this event, in which if any events are recieved by the server will be called.
	 * @param callback The callback function
	 */
	Connect(callback: (...args: CallArguments) => void): RBXScriptConnection;
}

/**
 * Interface for client sender events
 */
export interface ClientSenderEvent<CallArguments extends ReadonlyArray<unknown>> {
	/**
	 * Sends an event to the server with the specified arguments
	 * @param args The arguments
	 */
	SendToServer(...args: CallArguments): void;
}

class ClientEvent<
	ConnectArgs extends ReadonlyArray<unknown> = Array<unknown>,
	CallArguments extends ReadonlyArray<unknown> = Array<unknown>
> implements ClientListenerEvent<ConnectArgs>, ClientSenderEvent<CallArguments> {
	private instance: RemoteEvent;
	public constructor(name: string, private configuration: DefinitionConfiguration) {
		this.instance = getRemoteOrThrow("RemoteEvent", name);
		assert(!IS_SERVER, "Cannot fetch NetClientEvent on the server!");
	}

	/** @deprecated */
	public GetInstance() {
		return this.instance;
	}

	public static Wait<
		ConnectArgs extends ReadonlyArray<unknown> = Array<unknown>,
		CallArguments extends ReadonlyArray<unknown> = Array<unknown>
	>(name: string, configuration: DefinitionConfiguration) {
		return Promise.defer<ClientEvent<ConnectArgs, CallArguments>>(async resolve => {
			await waitForRemote("RemoteEvent", name, 60);
			resolve(new ClientEvent(name, configuration));
		});
	}

	public SendToServer(...args: CallArguments) {
		this.instance.FireServer(...args);
	}

	public Connect(callback: (...args: ConnectArgs) => void): RBXScriptConnection {
		const remoteId = this.instance.Name;
		const microprofile = this.configuration.MicroprofileCallbacks;

		if (microprofile) {
			return this.instance.OnClientEvent.Connect((...args) => {
				debug.profilebegin(`Net: ${remoteId}`);
				callback(...((args as unknown) as ConnectArgs));
			});
		} else {
			return this.instance.OnClientEvent.Connect(callback);
		}
	}
}

export default ClientEvent;
