import { format, IS_SERVER, NetManagedInstance, RequestCounter, ServerTickFunctions } from "../../internal";
import throttler from "./throttle";
import { ServerCallbackMiddleware } from "../../middleware";

const throttles = new Map<NetManagedInstance, RequestCounter>();

type RateLimitMiddleware = ServerCallbackMiddleware<any, Array<unknown>>;

export interface RateLimitError {
	Message: string;
	UserId: number;
	RemoteId: string;
	MaxRequestsPerMinute: number;
}

export interface RateLimitOptions {
	MaxRequestsPerMinute: number;
	/**
	 * @default "Request limit exceeded ({limit}) by {player} via {remote}"
	 */
	ThrottleMessage?: string;
	// /**
	//  * @default 60
	//  */
	// ThrottleTimer?: number;
	ErrorHandler?: (rateLimitError: RateLimitError) => void;
}

export function rateLimitWarningHandler(rateLimitError: RateLimitError) {
	warn("[rbx-net]", rateLimitError.Message);
}

const THROTTLE_RESET_TIMER = 60;

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
	const throttleMessage = options.ThrottleMessage ?? "Request limit exceeded ({limit}) by {player} via {remote}";

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
					Message: format(throttleMessage, {
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
		if (tick() > lastTick + THROTTLE_RESET_TIMER) {
			lastTick = tick();
			throttler.Clear();
		}
	});
}

export default createRateLimiter;
