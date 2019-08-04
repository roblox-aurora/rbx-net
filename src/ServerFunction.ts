import { findOrCreateRemote, IS_CLIENT } from "./internal";

/**
 * A function on the server
 * @rbxts server
 */
export default class NetServerFunction<CR extends any = any> {
	/** @internal */
	protected instance: RemoteFunction;

	constructor(name: string) {
		this.instance = findOrCreateRemote("RemoteFunction", name);
		assert(!IS_CLIENT, "Cannot create a Net.ServerFunction on the Client!");
	}

	/**
	 * The callback function
	 */
	public getCallback(): Callback {
		return this.instance.OnServerInvoke;
	}

	/**
	 * Set the callback function when called by the client
	 */
	public setCallback(func: Callback) {
		this.instance.OnServerInvoke = func;
		return this;
	}

	/**
	 * The RemoteFunction instance
	 */
	public getInstance() {
		return this.instance;
	}

	/**
	 * The client cache in seconds
	 */
	public getClientCache() {
		const cache = this.instance.FindFirstChild("Cache") as NumberValue;
		if (cache) {
			return cache.Value;
		} else {
			return 0;
		}
	}

	/**
	 * Sets a client cache timer in seconds
	 * @param time seconds to cache on client
	 */
	public setClientCache(time: number) {
		const cache = this.instance.FindFirstChild("Cache") as NumberValue;
		if (!cache) {
			const cacheTimer = new Instance("NumberValue", this.instance);
			cacheTimer.Value = time;
			cacheTimer.Name = "Cache";
		} else {
			cache.Value = time;
		}

		return this;
	}

	/**
	 * Calls the player and returns a promise
	 * @async returns Promise
	 * @param player The player to call the function on
	 * @param args The arguments to call the function with
	 */
	public async CallPlayerAsync<T extends Array<any>>(player: Player, ...args: T): Promise<CR> {
		warn(
			"[rbx-net] CallPlayerAsync is possibly going to be removed\n" +
				"\tsee https://github.com/roblox-aurora/rbx-net/issues/13 for more details.",
		);
		return this.instance.InvokeClient(player, ...args) as any;
	}
}
