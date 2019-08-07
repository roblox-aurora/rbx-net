import {
	getRemoteOrThrow,
	IS_CLIENT,
	functionExists,
	waitForFunction,
	MAX_CLIENT_WAITFORCHILD_TIMEOUT,
} from "./internal";

/**
 * A function on the client
 * @rbxts client
 */
export default class NetClientFunction<SR extends unknown> {
	/** @internal */
	private lastPing = -1;
	/** @internal */
	private cached: unknown = [];
	/** @internal */
	private instance: RemoteFunction;

	constructor(name: string) {
		this.instance = getRemoteOrThrow("RemoteFunction", name);
		assert(IS_CLIENT, "Cannot create a Net.ClientFunction on the Server!");
		assert(functionExists(name), `The specified function '${name}' does not exist!`);
	}

	public static async WaitFor<R extends any>(name: string): Promise<NetClientFunction<R>> {
		const fun: RemoteFunction | undefined = waitForFunction(name, MAX_CLIENT_WAITFORCHILD_TIMEOUT);
		if (!fun) {
			error("Failed to retrieve client Function!");
		}

		return new NetClientFunction<R>(name);
	}

	/**
	 * The remoteFunction instance
	 */
	public getInstance() {
		return this.instance;
	}

	/**
	 * The client cache in seconds
	 */
	public getCache() {
		const cache = this.instance.FindFirstChild("Cache") as NumberValue;
		if (cache) {
			return cache.Value;
		} else {
			return 0;
		}
	}

	/**
	 * Call the server with the specified arguments
	 * @param args The arguments to call the server with
	 * @returns the result of the call to the server
	 */
	public CallServer<T extends Array<any>>(...args: T): SR {
		if (this.lastPing < os.time() + this.getCache()) {
			const result = this.instance.InvokeServer(...args);
			this.cached = result;

			this.lastPing = os.time();

			return result as any;
		} else {
			return this.cached as SR;
		}
	}

	/**
	 * Call the server with the specified arguments asynchronously
	 * @param args The args to call the server with
	 * @async Will return a promise
	 */
	public async CallServerAsync<T extends Array<any>>(...args: T): Promise<SR> {
		return this.CallServer(...args);
	}
}
