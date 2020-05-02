import { RequestCounter, errorft, StaticArguments } from "./internal";
import throttler from "./Throttle";
import { GetConfiguration } from "./configuration";
import NetServerFunction from "./ServerFunction";

/**
 * A server function that can be rate limited
 * @rbxts server
 */
export default class NetServerThrottledFunction<C extends Array<any> = Array<unknown>> extends NetServerFunction<C> {
	/** @internal */
	public static rates = new Map<string, Array<number>>();

	private maxRequestsPerMinute: number = 0;
	private clientRequests: RequestCounter;

	constructor(name: string, rateLimit: number, ...recievedPropTypes: C) {
		super(name, ...recievedPropTypes);
		this.maxRequestsPerMinute = rateLimit;

		this.clientRequests = throttler.Get(`Function~${name}`);

		const clientValue = new Instance("IntValue", this.instance);
		clientValue.Name = "RateLimit";
		clientValue.Value = rateLimit;
	}

	public SetCallback<R extends unknown>(callback: (player: Player, ...args: StaticArguments<C>) => R) {
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
				// @ts-ignore ... again. unfortunately.
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
