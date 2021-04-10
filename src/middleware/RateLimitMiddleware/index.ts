import { errorft, format, IS_SERVER, NetManagedInstance, RequestCounter, ServerTickFunctions } from "../../internal";
import throttler from "./throttle";
import { GetConfiguration } from "../../configuration";
import { NetMiddleware } from "../../middleware";

const throttles = new Map<NetManagedInstance, RequestCounter>();

type RateLimitMiddleware = NetMiddleware<any, Array<unknown>>;

export interface RateLimitError {
	Message: string;
	UserId: number;
	RemoteId: string;
	MaxRequestsPerMinute: number;
}

export interface RateLimitOptions {
	MaxRequestsPerMinute: number;
	ErrorHandler?: (rateLimitError: RateLimitError) => void;
}

export function rateLimitWarningHandler(rateLimitError: RateLimitError) {
	warn("[rbx-net]", rateLimitError.Message);
}

/**
 * Creates a throttle middleware for this event
 *
 * Will limit the amount of requests a player can make to this event
 *
 * _NOTE: Must be used before **other** middlewares as it's not a type altering middleware_
 * @param maxRequestsPerMinute The maximum requests per minute
 */
function createRateLimiter(options: RateLimitOptions): RateLimitMiddleware {
	const maxRequestsPerMinute = options.MaxRequestsPerMinute;
	const errorHandler = options.ErrorHandler ?? rateLimitWarningHandler;
	return (processNext, event) => {
		const instance = event.GetInstance();
		let throttle = throttles.get(event)!;
		if (throttle === undefined) {
			throttle = throttler.Get(instance.GetFullName());
		}

		return (player, ...args) => {
			const count = throttle.Get(player);
			if (count >= maxRequestsPerMinute) {
				errorHandler?.({
					Message: format(GetConfiguration("ServerThrottleMessage"), {
						player: player.UserId,
						remote: instance.Name,
						limit: maxRequestsPerMinute,
					}),
					MaxRequestsPerMinute: maxRequestsPerMinute,
					RemoteId: instance.Name,
					UserId: player.UserId,
				});
			} else {
				throttle.Increment(player);
				return processNext(player, ...args);
			}
		};
	};
}

if (IS_SERVER) {
	let lastTick = 0;
	ServerTickFunctions.push(() => {
		if (tick() > lastTick + GetConfiguration("ServerThrottleResetTimer")) {
			lastTick = tick();
			throttler.Clear();
		}
	});
}

export default createRateLimiter;
