import { NetManagedInstance } from "../internal";
import createLoggerMiddleware from "./LoggerMiddleware";
import createRateLimiter from "./RateLimitMiddleware";
import NetTypeCheckingMiddleware from "./TypeCheckMiddleware";

export type NextCaller<R = void> = (player: defined, ...args: ReadonlyArray<unknown>) => R;

export type MiddlewareOverload<T extends readonly unknown[]> =
	| []
	| [NetMiddleware<T>]
	| [NetMiddleware, NetMiddleware<T>]
	| [NetMiddleware, NetMiddleware, NetMiddleware<T>]
	| [NetMiddleware, NetMiddleware, NetMiddleware, NetMiddleware<T>]
	| [NetMiddleware, NetMiddleware, NetMiddleware, NetMiddleware, NetMiddleware<T>]
	| [NetMiddleware, NetMiddleware, NetMiddleware, NetMiddleware, NetMiddleware, NetMiddleware<T>];

export type NetMiddleware<
	CallArguments extends ReadonlyArray<unknown> = Array<unknown>,
	PreviousCallArguments extends ReadonlyArray<unknown> = Array<unknown>
> = (
	next: (player: Player, ...args: CallArguments) => void,
	event: NetManagedInstance,
) => (sender: Player, ...args: PreviousCallArguments) => void;

export type NetGlobalMiddleware = (
	next: (player: Readonly<Player>, ...args: readonly unknown[]) => void,
	event: Readonly<NetManagedInstance>,
) => (sender: Readonly<Player>, ...args: readonly unknown[]) => void;

export interface ReadonlyGlobalMiddlewareArgs {
	(remoteName: string, remoteData: readonly unknown[], callingPlayer?: Player): void;
}

export namespace NetMiddleware {
	export const RateLimit = createRateLimiter;
	export const Logging = createLoggerMiddleware;

	/** The type checking middleware */
	export const TypeChecking = NetTypeCheckingMiddleware;

	/**
	 * Creates a global read-only middleware for use in `Net.Definitions` global middleware.
	 */
	export function Global(middleware: ReadonlyGlobalMiddlewareArgs) {
		return identity<NetGlobalMiddleware>((processNext, event) => (sender, ...args) => {
			middleware(event.GetInstance().Name, args, sender);
			return processNext(sender, ...args);
		});
	}
}

const createTypeChecker = NetTypeCheckingMiddleware;
export { createRateLimiter, createTypeChecker };
