import { errorft, NetManagedEvent, RequestCounter } from "../../internal";
import { NetMiddleware } from "..";
import throttler from "./throttle";
import { GetConfiguration } from "../../configuration";

const throttles = new Map<NetManagedEvent, RequestCounter>();

type RateLimitMiddleware = NetMiddleware<any, Array<unknown>>;

/**
 * Creates a throttle middleware for this event
 *
 * Will limit the amount of requests a player can make to this event
 *
 * _NOTE: Must be used before **other** middlewares as it's not a type altering middleware_
 * @param maxRequestsPerMinute The maximum requests per minute
 */
function createRateLimiter(maxRequestsPerMinute: number): RateLimitMiddleware {
	return (next, event) => {
		const instance = event.GetInstance();
		let throttle = throttles.get(event)!;
		if (throttle === undefined) {
			throttle = throttler.Get(instance.GetFullName());
		}

		return (player, ...args) => {
			const count = throttle.Get(player);
			if (count >= maxRequestsPerMinute) {
				errorft(GetConfiguration("ServerThrottleMessage"), {
					player: player.UserId,
					remote: instance.Name,
					limit: maxRequestsPerMinute,
				});
			} else {
				throttle.Increment(player);
				return next(player, ...args);
			}
		};
	};
}
export default createRateLimiter;
