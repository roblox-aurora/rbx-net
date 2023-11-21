import { NetGlobalMiddleware, ServerCallbackMiddleware, NextCaller } from "../middleware";

/** @internal */
export type MutableMiddlewareList = Array<ServerCallbackMiddleware<Array<unknown>>>;
export type MiddlewareList = ReadonlyArray<ServerCallbackMiddleware<ReadonlyArray<unknown>>>;
abstract class MiddlewareEvent {
	protected constructor(private readonly middlewares: MiddlewareList = []) {}

	/** @internal */
	public abstract GetInstance(): RemoteEvent;

	/** @internal */
	public _use(middleware: NetGlobalMiddleware) {
		(this.middlewares as MutableMiddlewareList).push(middleware);
	}

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
