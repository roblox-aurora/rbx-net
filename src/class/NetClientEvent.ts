import { getRemoteOrThrow, IS_SERVER } from "../internal";

class NetClientEvent {
	private instance: RemoteEvent;
	public constructor(name: string) {
		this.instance = getRemoteOrThrow("RemoteEvent", name);
		assert(!IS_SERVER, "Cannot fetch NetClientEvent on the server!");
	}

	public SendToServer(...args: unknown[]) {
		this.instance.FireServer(...args);
	}

	public Connect<CallArguments extends Array<unknown>>(
		callback: (...args: CallArguments) => void,
	): RBXScriptConnection {
		return this.instance.OnClientEvent.Connect(callback);
	}
}

export default NetClientEvent;
