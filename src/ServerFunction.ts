import { findOrCreateRemote, IS_CLIENT, StaticArguments, t_assert } from "./internal";

function t_string(value: unknown): value is string {
	return true;
}

/**
 * A function on the server
 * @rbxts server
 */
export default class NetServerFunction<CR extends any = any, C extends Array<any> = Array<unknown>> {
	/** @internal */
	protected instance: RemoteFunction;
	protected propTypes: C | undefined;

	constructor(name: string, ...recievedPropTypes: C) {
		this.instance = findOrCreateRemote("RemoteFunction", name);
		assert(!IS_CLIENT, "Cannot create a Net.ServerFunction on the Client!");

		if (recievedPropTypes.size() > 0) {
			this.propTypes = recievedPropTypes;
		}
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
	public setCallback<R extends unknown>(func: (player: Player, ...args: StaticArguments<C>) => R) {
		if (this.propTypes !== undefined) {
			this.instance.OnServerInvoke = (player: Player, ...args: Array<unknown>) => {
				if (t_assert(this.propTypes!, args)) {
					// @ts-ignore ... again. unfortunately.
					return func(player, ...args);
				} else {
					error("Client failed type checks", 2);
				}
			};
		} else {
			this.instance.OnServerInvoke = (func as unknown) as Callback;
		}

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
}
