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

	public setCallback(callback: Callback) {
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
	}

	/**
	 * The number of requests allowed per minute per user
	 */
	public setRateLimit(requestsPerMinute: number) {
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

	public getRateLimit() {
		return this.maxRequestsPerMinute;
	}
}
