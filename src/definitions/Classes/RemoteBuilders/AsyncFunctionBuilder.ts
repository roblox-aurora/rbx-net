import t from "@rbxts/t";
import { NetMiddleware, ServerCallbackMiddleware, createTypeChecker } from "../../../middleware";
import { MiddlewareList } from "../../../server/MiddlewareEvent";
import {
	AsyncClientFunctionDeclaration,
	AsyncFunctionDeclarationLike,
	AsyncServerFunctionDeclaration,
} from "../../Types";
import { CheckLike, RemoteBuilder, Serializable, SerializeClass } from "./RemoteBuilder";
import { Convert, InferValue, ToCheck } from "../../../middleware/TypeCheckMiddleware/types";
import createRateLimiter, { RateLimitOptions } from "../../../middleware/RateLimitMiddleware";
import { warnOnce } from "../../../internal";

export class AsyncFunctionBuilder<
	TParams extends readonly unknown[] = unknown[],
	TRet extends unknown = unknown
> extends RemoteBuilder<AsyncServerFunctionDeclaration<TParams, TRet>, AsyncClientFunctionDeclaration<TParams, TRet>> {
	public readonly serverCallbackMiddleware = new Array<ServerCallbackMiddleware>();

	public WithServerCallbackMiddleware<TNewParams extends readonly unknown[] = TParams>(
		...middlewares: readonly ServerCallbackMiddleware<TNewParams, TParams, TRet>[]
	): AsyncFunctionBuilder<TNewParams, TRet> {
		for (const middleware of middlewares) {
			this.serverCallbackMiddleware.push(middleware as never);
		}
		return this as never;
	}

	public WithRateLimit(options: RateLimitOptions) {
		this.serverCallbackMiddleware.push(createRateLimiter(options));
		return this;
	}

	public EnsureArguments<T extends readonly unknown[]>(...typeChecks: ToCheck<T>) {
		return this.WithServerCallbackMiddleware(createTypeChecker(...typeChecks) as never) as AsyncFunctionBuilder<
			T,
			TRet
		>;
	}

	public EnsureReturns<T extends CheckLike<unknown>>(
		check: T,
		onErr?: (player: Player, returnValue: unknown) => void,
	) {
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
		}) as AsyncFunctionBuilder<TParams, InferValue<T>>;
	}

	/**
	 * @internal
	 * @returns
	 */
	public Unsafe() {
		return this.WithServerCallbackMiddleware((processNext, instance) => {
			return (player, ...args) => {
				warnOnce(`Call to ${instance.GetInstance().Name} is considered unsafe`);
				return processNext(player, ...args);
			};
		});
	}

	public OnServer() {
		return {
			Type: "AsyncFunction",
			ServerMiddleware: this.serverCallbackMiddleware,
		} as AsyncServerFunctionDeclaration<TParams, TRet>;
	}

	public OnClient() {
		return {
			Type: "AsyncFunction",
			ServerMiddleware: this.serverCallbackMiddleware,
		} as AsyncClientFunctionDeclaration<TParams, TRet>;
	}
}
