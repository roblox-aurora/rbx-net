import { getRemoteOrThrow, IS_SERVER, waitForEvent } from "../internal";

class NetClientEvent {
	private instance: RemoteEvent;
	public constructor(name: string) {
		this.instance = getRemoteOrThrow("RemoteEvent", name);
		assert(!IS_SERVER, "Cannot fetch NetClientEvent on the server!");
	}

	public static Wait(name: string) {
		return Promise.defer<NetClientEvent>((resolve, reject) => {
			const remote = waitForEvent(name, 10);
			if (remote) {
				resolve(new NetClientEvent(name));
			} else {
				reject();
			}
		});
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
