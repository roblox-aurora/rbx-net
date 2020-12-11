import { NetManagedEvent } from "../internal";
import createRateLimiter from "./RateLimitMiddleware";
import createTypeChecker from "./TypeCheckMiddleware";

export type NextCaller<R = void> = (player: defined, ...args: ReadonlyArray<unknown>) => R;

export type NetMiddleware<
	CallArguments extends ReadonlyArray<unknown> = Array<unknown>,
	PreviousCallArguments extends ReadonlyArray<unknown> = Array<unknown>,
	Sender = Player,
	PreviousSender = Player
> = (
	next: (player: Sender, ...args: CallArguments) => void,
	event: NetManagedEvent,
) => (sender: PreviousSender, ...args: PreviousCallArguments) => void;

export { createRateLimiter, createTypeChecker };
