import { getRemoteOrThrow, IS_SERVER, waitForRemote } from "../internal";
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

	public static Wait<
		ConnectArgs extends ReadonlyArray<unknown> = Array<unknown>,
		CallArguments extends ReadonlyArray<unknown> = Array<unknown>,
	>(name: string, configuration: NetworkModelConfiguration) {
		return Promise.defer<UnreliableClientEvent<ConnectArgs, CallArguments>>(async (resolve) => {
			await waitForRemote("UnreliableRemoteEvent", name, 60);
			resolve(new UnreliableClientEvent(name, undefined, configuration));
		});
	}

	/** @deprecated */
	public GetInstance() {
		return this.instance;
	}

	public SendToServer(...args: CallArguments) {
		this.instance.FireServer(...args);
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
			return this.instance.OnClientEvent.Connect(callback);
		}
	}
}

export default UnreliableClientEvent;
