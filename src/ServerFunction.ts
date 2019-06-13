import { findOrCreateRemote, IS_CLIENT } from "./internal";

/**
 * A function on the server
 * @rbxts server
 */
export default class NetServerFunction<CR extends any = any> {
	/** @internal */
	protected instance: RemoteFunction;

	/**
	 * Creates a new instance of a server function (Will also create the corresponding remote if it does not exist!)
	 * @param name The name of this server function
	 * @param rateLimit The number of requests allowed per minute per client (0 = none)
	 * @throws If not created on server
	 */
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
	}

	/**
	 * # use setCallback!
	 * This is now deprecated, as setters and getters will be removed in a future roblox-ts release!
	 *
	 * @deprecated
	 */
	public set Callback(func: Callback) {
		warn(
			"[rbx-net] use ClientFunction.setCallback(x) instead of " +
				" ClientFunction.Callback = x, as this will be removed in a future version!",
		);
		this.instance.OnServerInvoke = func;
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
	}

	/**
	 * Calls the player and returns a promise
	 * @async returns Promise
	 * @param player The player to call the function on
	 * @param args The arguments to call the function with
	 */
	public async CallPlayerAsync<T extends Array<any>>(player: Player, ...args: T): Promise<CR> {
		return this.instance.InvokeClient(player, ...args) as any;
	}
}
