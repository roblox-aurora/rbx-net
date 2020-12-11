import { getRemoteOrThrow, IS_SERVER, waitForRemote } from "../internal";

export default class ClientFunction<CallArgs extends ReadonlyArray<unknown>, ServerReturnType = unknown> {
	private instance: RemoteFunction;

	constructor(name: string) {
		this.instance = getRemoteOrThrow("RemoteFunction", name);
		assert(!IS_SERVER, "Cannot create a Net.ClientFunction on the Server!");
	}

	public static Wait<CallArgs extends ReadonlyArray<unknown> = Array<unknown>, ServerReturnType = unknown>(
		name: string,
	) {
		return Promise.defer<ClientFunction<CallArgs, ServerReturnType>>(async (resolve) => {
			await waitForRemote("RemoteFunction", name, 10);
			resolve(new ClientFunction(name));
		});
	}

	public async CallServerAsync(...args: CallArgs): Promise<ServerReturnType> {
		return Promise.defer<ServerReturnType>((resolve) => {
			const result = this.instance.InvokeServer(...args) as ServerReturnType;
			resolve(result);
		});
	}
}
