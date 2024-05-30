import { NetGlobalMiddleware, ServerCallbackMiddleware, NextCaller } from "../middleware";
import { MiddlewareList, MutableMiddlewareList } from "./MiddlewareEvent";

abstract class MiddlewareFunction {
	protected constructor(private readonly middlewares: MiddlewareList = []) {}
	public abstract GetInstance(): RemoteFunction;

	/** @internal */
	public _use(middleware: NetGlobalMiddleware) {
		(this.middlewares as MutableMiddlewareList).push(middleware);
	}

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
