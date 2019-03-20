import NetServerEvent from "./ServerEvent";
import { RequestCounter, errorft } from "./internal";
import throttler from "./Throttle";
import { GetConfiguration } from "./configuration";

/**
 * A server event that can be rate limited
 * @rbxts server
 */
export default class NetServerThrottledEvent extends NetServerEvent {
	private maxRequestsPerMinute: number = 0;
	private clientRequests: RequestCounter;

	constructor(name: string, rateLimit: number) {
		super(name);
		this.maxRequestsPerMinute = rateLimit;

		this.clientRequests = throttler.Get(`Event~${name}`);

		const clientValue = new Instance("IntValue", this.instance);
		clientValue.Name = "RateLimit";
		clientValue.Value = rateLimit;
	}

	/**
	 * The RBXScriptSignal for this RemoteEvent
	 */
	public get Event() {
		error("Use 'Connect' instead foor ServerThrottledEvent!");
		return this.instance.OnServerEvent;
	}

	/**
	 * Connect a fucntion to fire when the event is invoked by the client
	 * @param callback The function fired when the event is invoked by the client
	 */
	public Connect<T extends Array<any>>(callback: (sourcePlayer: Player, ...args: T) => void) {
		this.instance.OnServerEvent.Connect((player: Player, ...args: Array<any>) => {
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
				callback(player, ...(args as T));
			}
		});
	}

	/**
	 * The number of requests allowed per minute per user
	 */
	public set RateLimit(requestsPerMinute: number) {
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

	public get RateLimit() {
		return this.maxRequestsPerMinute;
	}
}
