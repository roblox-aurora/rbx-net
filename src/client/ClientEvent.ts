import { getRemoteOrThrow, IS_SERVER, waitForRemote } from "../internal";

class ClientEvent<
	ConnectArgs extends ReadonlyArray<unknown> = Array<unknown>,
	CallArguments extends ReadonlyArray<unknown> = Array<unknown>
> {
	private instance: RemoteEvent;
	public constructor(name: string) {
		this.instance = getRemoteOrThrow("RemoteEvent", name);
		assert(!IS_SERVER, "Cannot fetch NetClientEvent on the server!");
	}

	public static Wait<
		ConnectArgs extends ReadonlyArray<unknown> = Array<unknown>,
		CallArguments extends ReadonlyArray<unknown> = Array<unknown>
	>(name: string) {
		return Promise.defer<ClientEvent<ConnectArgs, CallArguments>>(async (resolve) => {
			await waitForRemote("RemoteEvent", name, 10);
			resolve(new ClientEvent(name));
		});
	}

	public SendToServer(...args: CallArguments) {
		this.instance.FireServer(...args);
	}

	public Connect(callback: (...args: ConnectArgs) => void): RBXScriptConnection {
		return this.instance.OnClientEvent.Connect(callback);
	}
}

export default ClientEvent;
