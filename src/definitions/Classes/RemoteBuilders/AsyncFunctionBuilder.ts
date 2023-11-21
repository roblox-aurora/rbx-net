import { NetMiddleware, ServerCallbackMiddleware, createTypeChecker } from "../../../middleware";
import { AsyncClientFunctionDeclaration, AsyncServerFunctionDeclaration, FunctionCacheOptions } from "../../Types";
import { CheckLike, RemoteBuilder } from "./RemoteBuilder";
import { Convert, InferValue, ToCheck } from "../../../middleware/TypeCheckMiddleware/types";
import createRateLimiter, { RateLimitOptions } from "../../../middleware/RateLimitMiddleware";
import { warnOnce } from "../../../internal";
import { Unsafe } from "./EventBuilder";

type TransposeUnsafe<T, U> = T extends Unsafe<infer _> ? Unsafe<U> : U;

export class AsyncFunctionBuilder<
	TParams extends ReadonlyArray<unknown> = Array<unknown>,
	TRet = unknown,
> extends RemoteBuilder<AsyncServerFunctionDeclaration<TParams, TRet>, AsyncClientFunctionDeclaration<TParams, TRet>> {
	private cacheOptions: FunctionCacheOptions | undefined;

	/**
	 * Adds server callback middleware to this remote
	 * @param middlewares The server callback middleware to add
	 */
	public WithServerCallbackMiddleware<TNewParams extends ReadonlyArray<unknown> = TParams>(
		...middlewares: ReadonlyArray<ServerCallbackMiddleware<TNewParams, TParams, TRet>>
	): AsyncFunctionBuilder<TNewParams, TRet> {
		for (const middleware of middlewares) {
			this.serverCallbackMiddleware.push(middleware as never);
		}
		return this as never;
	}

	/**
	 * Sets a rate limit on this remote
	 * @param options The rate limit options
	 * @returns
	 */
	public WithRateLimit(options: RateLimitOptions) {
		this.serverCallbackMiddleware.push(createRateLimiter(options));
		return this;
	}

	/**
	 * Sets cache options for this remote
	 * @param cacheOptions The cache options for this remote
	 * @returns
	 */
	public WithCache(cacheOptions: FunctionCacheOptions) {
		this.cacheOptions = cacheOptions;
		return this;
	}

	/**
	 * Sets the argument types for this remote
	 * @param typeChecks The argument checks for this remote
	 */
	public WithArgumentTypes<T extends ReadonlyArray<unknown>>(
		...typeChecks: ToCheck<T>
	): AsyncFunctionBuilder<T, TRet> {
		return this.WithServerCallbackMiddleware(createTypeChecker(...typeChecks) as never) as AsyncFunctionBuilder<
			T,
			TRet
		>;
	}

	/**
	 * Sets the return cehck for the async remote function
	 * @param check The return check
	 * @param onErr The error handler for this remote
	 */
	public WithReturnType<T extends CheckLike<unknown>>(
		check: T,
		onErr?: (player: Player, returnValue: unknown) => void,
	): TransposeUnsafe<this, AsyncFunctionBuilder<TParams, InferValue<T>>> {
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
		}) as TransposeUnsafe<this, AsyncFunctionBuilder<TParams, InferValue<T>>>;
	}

	/**
	 * @internal
	 */
	public OnServer() {
		return {
			Type: "AsyncFunction",
			ServerMiddleware: this.serverCallbackMiddleware,
		} as AsyncServerFunctionDeclaration<TParams, TRet>;
	}

	/**
	 * @internal
	 */
	public OnClient() {
		return {
			Type: "AsyncFunction",
			ServerMiddleware: this.serverCallbackMiddleware,
		} as AsyncClientFunctionDeclaration<TParams, TRet>;
	}
}
