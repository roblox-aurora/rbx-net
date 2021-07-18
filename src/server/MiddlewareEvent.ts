import { $ifEnv } from "rbxts-transform-env";
import { NetGlobalMiddleware, NetMiddleware, NextCaller } from "../middleware";

/** @internal */
export type MutableMiddlewareList = Array<NetMiddleware<Array<unknown>>>;
export type MiddlewareList = ReadonlyArray<NetMiddleware<ReadonlyArray<unknown>>>;
abstract class MiddlewareEvent {
	protected constructor(private readonly middlewares: MiddlewareList = []) {}

	/** @internal */
	abstract GetInstance(): RemoteEvent;
	abstract GetId(): string;

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

	protected _processArguments(args: unknown[]) {
		for (const [index, value] of ipairs(args)) {
			if (typeIs(value, "table")) {
				const meta = getmetatable(value);
				// if (meta) {
				// 	args[index - 1] = meta.serialize();
				// }
			}
		}
		return args;
	}
}

export default MiddlewareEvent;
