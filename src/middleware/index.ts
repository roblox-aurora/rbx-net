import { NetManagedInstance } from "../internal";
import createLoggerMiddleware from "./LoggerMiddleware";
import createRateLimiter from "./RateLimitMiddleware";
import createTypeChecker from "./TypeCheckMiddleware";

export type NextCaller<R = void> = (player: defined, ...args: ReadonlyArray<unknown>) => R;

export type NetMiddleware<
	CallArguments extends ReadonlyArray<unknown> = Array<unknown>,
	PreviousCallArguments extends ReadonlyArray<unknown> = Array<unknown>
> = (
	next: (player: Player, ...args: CallArguments) => void,
	event: NetManagedInstance,
) => (sender: Player, ...args: PreviousCallArguments) => void;

export namespace NetMiddlewares {
	export const RateLimit = createRateLimiter;
	export const Logging = createLoggerMiddleware;
	export const TypeChecking = createTypeChecker;
}

export { createRateLimiter, createTypeChecker };
