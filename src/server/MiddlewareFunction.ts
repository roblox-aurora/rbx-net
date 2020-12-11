import { NetMiddleware, NextCaller } from "../middleware";
import { MiddlewareList } from "./MiddlewareEvent";

abstract class MiddlewareFunction {
	protected constructor(private readonly middlewares: MiddlewareList = []) {}
	abstract GetInstance(): RemoteFunction;
	protected _processMiddleware<A extends ReadonlyArray<unknown>, R = void>(
		callback: (player: Player, ...args: A) => R,
	) {
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

export default MiddlewareFunction;
