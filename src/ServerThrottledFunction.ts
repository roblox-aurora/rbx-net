import { RequestCounter, errorft } from "./internal";
import throttler from "./Throttle";
import { GetConfiguration } from "./configuration";
import NetServerFunction from "./ServerFunction";

/**
 * A server function that can be rate limited
 * @rbxts server
 */
export default class NetServerThrottledFunction<CR extends any = any> extends NetServerFunction<CR> {
	/** @internal */
	public static rates = new Map<string, Array<number>>();

	private maxRequestsPerMinute: number = 0;
	private clientRequests: RequestCounter;

	constructor(name: string, rateLimit: number) {
		super(name);
		this.maxRequestsPerMinute = rateLimit;

		this.clientRequests = throttler.Get(`Function~${name}`);

		const clientValue = new Instance("IntValue", this.instance);
		clientValue.Name = "RateLimit";
		clientValue.Value = rateLimit;
	}

	/**
	 * @deprecated
	 * @see SetCallback
	 */
	public readonly setCallback = (func: Callback) => {
		warn(`${this.instance.Name}::setCallback is deprecated, use ${this.instance.Name}::SetCallback instead!`);
		return this.SetCallback(func);
	};

	/**
	 * @deprecated
	 * @see SetRateLimit
	 */
	public readonly setRateLimit = (requestsPerMinute: number) => {
		warn(`${this.instance.Name}::setRateLimit is deprecated, use ${this.instance.Name}::SetRateLimit instead!`);
		return this.SetRateLimit(requestsPerMinute);
	};

	/**
	 * @deprecated
	 * @see GetRateLimit
	 */
	public readonly getRateLimit = () => {
		warn(`${this.instance.Name}::getRateLimit is deprecated, use ${this.instance.Name}::GetRateLimit instead!`);
		return this.GetRateLimit();
	};

	public SetCallback(callback: Callback) {
		this.instance.OnServerInvoke = (player: Player, ...args: Array<unknown>) => {
			const maxRequests = this.maxRequestsPerMinute;
			const clientRequestCount = this.clientRequests.Get(player);
			if (clientRequestCount >= maxRequests) {
				errorft(GetConfiguration("ServerThrottleMessage"), {
					player: player.UserId,
					remote: this.instance.Name,
					limit: maxRequests,
				});
			} else {
				this.clientRequests.Increment(player);
				return callback(player, ...args);
			}
		};
		return this;
	}

	/**
	 * The number of requests allowed per minute per user
	 */
	public SetRateLimit(requestsPerMinute: number) {
		this.maxRequestsPerMinute = requestsPerMinute;

		let clientValue = this.instance.FindFirstChild<IntValue>("RateLimit");
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
