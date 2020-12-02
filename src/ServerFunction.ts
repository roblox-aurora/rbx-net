import {
	findOrCreateRemote,
	IS_CLIENT,
	StaticArguments,
	checkArguments,
	RequestCounter,
	errorft,
	TypeGuard,
} from "./internal";
import throttler from "./Throttle";
import { GetConfiguration } from "./configuration";
const UNLIMITED_REQUESTS = -1;

/**
 * A function on the server
 * @rbxts server
 */
export default class NetServerFunction<C extends Array<any> = Array<unknown>> {
	private invalidRequestHandler = GetConfiguration("InvalidPropTypesHandler");
	private maxRequestsPerMinute = UNLIMITED_REQUESTS;
	private clientRequests: RequestCounter;

	/** @internal */
	protected instance: RemoteFunction;
	protected propTypes: C | undefined;

	constructor(name: string, ...recievedPropTypes: C) {
		this.instance = findOrCreateRemote("RemoteFunction", name);
		assert(!IS_CLIENT, "Cannot create a Net.ServerFunction on the Client!");

		this.clientRequests = throttler.Get(`Function~${name}`);

		if (recievedPropTypes.size() > 0) {
			this.propTypes = recievedPropTypes;
		}
	}

	/**
	 * Creates a RemoteFunction that's not managed by Net.
	 *
	 * Note: Any features like throttling, caching, type checking etc. will have to be handled by you.
	 *
	 * @param name The name
	 */
	public static Unmanaged(name: string) {
		return findOrCreateRemote("RemoteFunction", name);
	}

	/**
	 * The callback function
	 */
	public GetCallback(): Callback | undefined {
		return this.instance.OnServerInvoke;
	}

	/**
	 * Set the callback function when called by the client
	 */
	public SetCallback<R extends unknown>(func: (player: Player, ...args: StaticArguments<C>) => R) {
		if (this.propTypes !== undefined) {
			this.instance.OnServerInvoke = (player: Player, ...args: Array<unknown>) => {
				const maxRequests = this.maxRequestsPerMinute;

				// If throttling...
				if (maxRequests > 0) {
					const clientRequestCount = this.clientRequests.Get(player);
					if (clientRequestCount >= maxRequests) {
						errorft(GetConfiguration("ServerThrottleMessage"), {
							player: player.UserId,
							remote: this.instance.Name,
							limit: maxRequests,
						});
					} else {
						this.clientRequests.Increment(player);
					}
				}

				if (checkArguments(this.propTypes! as Array<TypeGuard<unknown>>, args)) {
					return func(player, ...(args as StaticArguments<C>));
				} else {
					// tslint:disable-next-line: no-unused-expression
					this.invalidRequestHandler && this.invalidRequestHandler(this, player);
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
	public GetInstance() {
		return this.instance;
	}

	/**
	 * The client cache in seconds
	 */
	public GetClientCache() {
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
	public SetClientCache(time: number) {
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
	 * The number of requests allowed per minute per user
	 */
	public SetRateLimit(requestsPerMinute: number) {
		this.maxRequestsPerMinute = requestsPerMinute;

		let clientValue = this.instance.FindFirstChild("RateLimit") as IntValue;
		if (clientValue) {
			clientValue.Value = requestsPerMinute;
		} else {
			clientValue = new Instance("IntValue", this.instance);
			clientValue.Name = "RateLimit";
			clientValue.Value = requestsPerMinute;
		}
	}

	public GetRateLimit() {
		return this.maxRequestsPerMinute;
	}
}
