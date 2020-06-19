import NetServerEvent from "./ServerEvent";
import { RequestCounter, errorft, StaticArguments } from "./internal";
import throttler from "./Throttle";
import { GetConfiguration } from "./configuration";

/**
 * A server event that can be rate limited
 * @rbxts server
 */
export default class NetServerThrottledEvent<C extends Array<any> = Array<unknown>> extends NetServerEvent<C> {
	private maxRequestsPerMinute = 0;
	private clientRequests: RequestCounter;

	constructor(name: string, rateLimit: number, ...recievedPropTypes: C) {
		super(name, ...recievedPropTypes);
		this.maxRequestsPerMinute = rateLimit;

		this.clientRequests = throttler.Get(`Event~${name}`);

		const clientValue = new Instance("IntValue", this.instance);
		clientValue.Name = "RateLimit";
		clientValue.Value = rateLimit;
	}

	/**
	 * Connect a fucntion to fire when the event is invoked by the client
	 * @param callback The function fired when the event is invoked by the client
	 */
	public Connect(callback: (sourcePlayer: Player, ...args: StaticArguments<C>) => void) {
		return this.instance.OnServerEvent.Connect((player: Player, ...args: Array<any>) => {
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
				callback(player, ...((args as unknown) as StaticArguments<C>));
			}
		});
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
