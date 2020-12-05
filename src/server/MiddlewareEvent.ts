import { Middleware, NextCaller } from "../middleware";

export type MiddlewareList = Array<Middleware<Array<unknown>>>;
abstract class MiddlewareEvent {
	protected constructor(private readonly middlewares: MiddlewareList = []) {}
	abstract GetInstance(): RemoteEvent;
	protected _processMiddleware<A extends Array<unknown>, R = void>(callback: (player: Player, ...args: A) => R) {
		const { middlewares } = this;
		try {
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
