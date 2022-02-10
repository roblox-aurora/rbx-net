import { getRemoteOrThrow, IS_SERVER, TagId, waitForRemote } from "../internal";
const CollectionService = game.GetService("CollectionService");

export default class ClientFunction<CallArgs extends ReadonlyArray<unknown>, ServerReturnType = unknown> {
	private instance: RemoteFunction;

	constructor(private name: string) {
		this.instance = getRemoteOrThrow("RemoteFunction", name);
		assert(!IS_SERVER, "Cannot create a Net.ClientFunction on the Server!");
	}

	public static Wait<CallArgs extends ReadonlyArray<unknown> = Array<unknown>, ServerReturnType = unknown>(
		name: string,
	) {
		return Promise.defer<ClientFunction<CallArgs, ServerReturnType>>(async (resolve) => {
			await waitForRemote("RemoteFunction", name, 60);
			resolve(new ClientFunction(name));
		});
	}

	/**
	 * Will call the server synchronously
	 * @param args The call arguments
	 */
	public CallServer(...args: CallArgs): ServerReturnType {
		if (CollectionService.HasTag(this.instance, TagId.DefaultFunctionListener)) {
			throw `Attempted to call Function '${this.name}' - which has no user defined callback`;
		}

		return this.instance.InvokeServer(...args);
	}

	/**
	 * Will call the server asynchronously
	 * @param args The call arguments
	 */
	public async CallServerAsync(...args: CallArgs): Promise<ServerReturnType> {
		return Promise.defer<ServerReturnType>((resolve) => {
			const result = this.instance.InvokeServer(...args) as ServerReturnType;
			resolve(result);
		});
	}
}
