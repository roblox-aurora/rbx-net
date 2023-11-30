import { getRemoteOrThrow, IS_SERVER } from "../internal";
import { ClientCallbackMiddleware } from "../middleware";
import { NetworkModelConfiguration } from "../definitions";
import { ClientListenerEvent, ClientSenderEvent } from "./ClientEvent";

class UnreliableClientEvent<
		ConnectArgs extends ReadonlyArray<unknown> = Array<unknown>,
		CallArguments extends ReadonlyArray<unknown> = Array<unknown>,
	>
	implements ClientListenerEvent<ConnectArgs>, ClientSenderEvent<CallArguments>
{
	private instance: UnreliableRemoteEvent;
	public constructor(
		name: string,
		middleware: Array<ClientCallbackMiddleware> = [],
		private configuration: NetworkModelConfiguration,
	) {
		this.instance = getRemoteOrThrow("UnreliableRemoteEvent", name);
		assert(!IS_SERVER, "Cannot fetch NetClientEvent on the server!");
	}

	/** @deprecated */
	public GetInstance() {
		return this.instance;
	}

	public SendToServer(...args: CallArguments) {
		(this.instance as unknown as RemoteEvent).FireServer(...args);
	}

	public Connect(callback: (...args: ConnectArgs) => void): RBXScriptConnection {
		const id = this.instance.Name;
		const microprofile = this.configuration.MicroprofileCallbacks;

		if (microprofile) {
			return this.instance.OnClientEvent.Connect((...args) => {
				debug.profilebegin(`NetEvent: ${id}`);
				callback(...(args as unknown as ConnectArgs));
			});
		} else {
			return (this.instance as unknown as RemoteEvent).OnClientEvent.Connect(callback);
		}
	}
}

export default UnreliableClientEvent;
