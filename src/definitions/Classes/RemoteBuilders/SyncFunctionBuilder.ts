import { NetMiddleware, ServerCallbackMiddleware, createTypeChecker } from "../../../middleware";
import { FunctionDeclaration } from "../../Types";
import { CheckLike, ServerBuilder } from "./RemoteBuilder";
import { InferValue, ToCheck } from "../../../middleware/TypeCheckMiddleware/types";
import { Unsafe } from "./EventBuilder";

type TransposeUnsafe<T, U> = T extends Unsafe<infer _> ? Unsafe<U> : U;

export class SyncFunctionBuilder<TParams extends ReadonlyArray<unknown> = Array<unknown>, TRet = unknown>
	implements ServerBuilder<FunctionDeclaration<TParams, TRet>>
{
	public serverCallbackMiddleware: Array<ServerCallbackMiddleware> = [];

	public WithServerCallbackMiddleware<TNewParams extends ReadonlyArray<unknown> = TParams>(
		...middlewares: ReadonlyArray<ServerCallbackMiddleware<TNewParams, TParams, TRet>>
	): SyncFunctionBuilder<TNewParams, TRet> {
		for (const middleware of middlewares) {
			this.serverCallbackMiddleware.push(middleware as never);
		}
		return this as never;
	}

	public WithArguments<T extends ReadonlyArray<unknown>>(...typeChecks: ToCheck<T>): SyncFunctionBuilder<T, TRet> {
		return this.WithServerCallbackMiddleware(createTypeChecker(...typeChecks) as never) as SyncFunctionBuilder<
			T,
			TRet
		>;
	}

	public EnsureReturns<T extends CheckLike<unknown>>(
		check: T,
		onErr?: (player: Player, returnValue: unknown) => void,
	): TransposeUnsafe<this, SyncFunctionBuilder<TParams, InferValue<T>>> {
		return this.WithServerCallbackMiddleware((processNext, _instance) => {
			return (player, ...args) => {
				const result = processNext(player, ...args);
				if (check(result)) {
					return result;
				} else {
					onErr?.(player, result);
					return NetMiddleware.Skip;
				}
			};
		}) as TransposeUnsafe<this, SyncFunctionBuilder<TParams, InferValue<T>>>;
	}

	public OnServer(): FunctionDeclaration<TParams, TRet> {
		return {
			Type: "Function",
			ServerMiddleware: this.serverCallbackMiddleware,
		} as FunctionDeclaration<TParams, TRet>;
	}
}
