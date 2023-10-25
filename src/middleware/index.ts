import { NetManagedInstance } from "../internal";
import createLoggerMiddleware from "./LoggerMiddleware";
import createRateLimiter from "./RateLimitMiddleware";
import NetTypeCheckingMiddleware from "./TypeCheckMiddleware";

export type NextCaller<R = void> = (player: defined, ...args: ReadonlyArray<unknown>) => R;

export type MiddlewareOverload<T extends readonly unknown[]> =
	| []
	| [ServerCallbackMiddleware<T>]
	| [ServerCallbackMiddleware, ServerCallbackMiddleware<T>]
	| [ServerCallbackMiddleware, ServerCallbackMiddleware, ServerCallbackMiddleware<T>]
	| [ServerCallbackMiddleware, ServerCallbackMiddleware, ServerCallbackMiddleware, ServerCallbackMiddleware<T>]
	| [
			ServerCallbackMiddleware,
			ServerCallbackMiddleware,
			ServerCallbackMiddleware,
			ServerCallbackMiddleware,
			ServerCallbackMiddleware<T>,
	  ]
	| [
			ServerCallbackMiddleware,
			ServerCallbackMiddleware,
			ServerCallbackMiddleware,
			ServerCallbackMiddleware,
			ServerCallbackMiddleware,
			ServerCallbackMiddleware<T>,
	  ];

export type ServerCallbackMiddleware<
	CallArguments extends ReadonlyArray<unknown> = Array<unknown>,
	PreviousCallArguments extends ReadonlyArray<unknown> = Array<unknown>,
	Ret = void
> = (
	next: (player: Player, ...args: CallArguments) => Ret,
	event: NetManagedInstance,
) => (sender: Player, ...args: PreviousCallArguments) => Ret | NetMiddleware.Skip;

export type ClientCallbackMiddleware<
	CallArguments extends ReadonlyArray<unknown> = Array<unknown>,
	PreviousCallArguments extends ReadonlyArray<unknown> = Array<unknown>,
	Ret = void
> = (
	next: (...args: CallArguments) => Ret,
	event: NetManagedInstance,
) => (...args: PreviousCallArguments) => Ret | NetMiddleware.Skip;

export type ServerInvokeMiddleware<
	CallArguments extends ReadonlyArray<unknown> = unknown[],
	PreviousCallArguments extends ReadonlyArray<unknown> = Array<unknown>
> = (
	next: (player: Player, ...args: CallArguments) => void,
	event: NetManagedInstance,
) => (player: Player, ...args: PreviousCallArguments) => NetMiddleware.Skip | void;

export type NetMiddleware = ServerCallbackMiddleware;

export type NetGlobalMiddleware = (
	next: (player: Readonly<Player>, ...args: readonly unknown[]) => void,
	event: Readonly<NetManagedInstance>,
) => (sender: Readonly<Player>, ...args: readonly unknown[]) => void;

export interface ReadonlyGlobalMiddlewareArgs {
	(remoteName: string, remoteData: readonly unknown[], callingPlayer?: Player): void;
}

export namespace NetMiddleware {
	export interface Skip {
		readonly __nominal_Middleware_Skip: unique symbol;
	}
	export const Skip = {} as Skip;

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
