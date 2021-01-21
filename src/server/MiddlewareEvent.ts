import { $ifEnv } from "rbxts-transform-env";
import { NetMiddleware, NextCaller } from "../middleware";

export type MiddlewareList = ReadonlyArray<NetMiddleware<ReadonlyArray<unknown>>>;
abstract class MiddlewareEvent {
	protected constructor(private readonly middlewares: MiddlewareList = []) {}
	abstract GetInstance(): RemoteEvent;
	protected _processMiddleware<A extends ReadonlyArray<unknown>, R = void>(
		callback: (player: Player, ...args: A) => R,
	) {
		const { middlewares } = this;
		try {
			assert(
				typeIs(middlewares, "table"),
				"The middleware argument should be an array of middlewares not a " + typeOf(middlewares),
			);

			if (middlewares.size() > 0) {
				let callbackFn = callback as NextCaller<R>;

				// Run through each middleware
				for (const middleware of middlewares) {
					callbackFn = middleware(callbackFn, this) as NextCaller<R>;
				}

				return callbackFn;
			} else {
				return callback;
			}
		} catch (e) {
			warn("[rbx-net] " + tostring(e));
		}
	}
}

export default MiddlewareEvent;
