/* eslint-disable no-restricted-syntax */
import { t } from "@rbxts/t";
import { ClientCallbackMiddleware, ServerCallbackMiddleware, createTypeChecker } from "../../../middleware";
import createRateLimiter, { RateLimitOptions } from "../../../middleware/RateLimitMiddleware";
import { ToCheck } from "../../../middleware/TypeCheckMiddleware/types";
import { ClientToServerEventDeclaration, ServerToClientEventDeclaration } from "../../Types";
import { AsyncFunctionBuilder } from "./AsyncFunctionBuilder";
import { CheckLike, RemoteBuilder } from "./RemoteBuilder";
import { SyncFunctionBuilder } from "./SyncFunctionBuilder";

export type Unsafe<T> = T & { readonly __nominal_Unsafe: unique symbol };

export class EventBuilder<TParams extends ReadonlyArray<unknown> = Array<unknown>> extends RemoteBuilder<
	ServerToClientEventDeclaration<TParams>,
	ClientToServerEventDeclaration<TParams>
> {
	private useUnreliable = false;

	/**
	 * Sets the argument types for this remote
	 * @param typeChecks The argument checks for this remote
	 */
	public WithArgumentTypes<T extends ReadonlyArray<unknown>>(...typeChecks: ToCheck<T>): EventBuilder<T> {
		return this.WithServerCallbackMiddleware(createTypeChecker(...typeChecks) as never) as EventBuilder<T>;
	}

	/**
	 * Sets the remote as one that returns a value to the caller
	 */
	public WhichReturnsAsync<TRet>(): Unsafe<AsyncFunctionBuilder<TParams, TRet>>;
	public WhichReturnsAsync<TRet>(check: CheckLike<TRet>): AsyncFunctionBuilder<TParams, TRet>;
	public WhichReturnsAsync<TRet>(check?: CheckLike<TRet>): AsyncFunctionBuilder<TParams, TRet> {
		const builder = new AsyncFunctionBuilder<TParams, TRet>();
		builder.serverCallbackMiddleware = this.serverCallbackMiddleware;
		return check ? builder.WithReturnType(check) : builder;
	}

	/**
	 * Sets the remote as one that returns a value to the caller
	 */
	public WhichReturnsSync<TRet>(check: CheckLike<TRet>): SyncFunctionBuilder<TParams, TRet> {
		const builder = new SyncFunctionBuilder<TParams, TRet>();
		builder.serverCallbackMiddleware = this.serverCallbackMiddleware;
		return builder.EnsureReturns(check);
	}

	/**
	 * TODO: Enable when released
	 *
	 * Makes the remote event unreliable - will internally use `UnreliableRemoteEvent` instead of `RemoteEvent` if true.
	 * @deprecated Not a feature just yet
	 */
	public SetUnreliable(unreliable: boolean) {
		this.useUnreliable = unreliable;
		return this;
	}

	/**
	 * Adds client callback middleware to this remote
	 * @param middlewares The server callback middleware to add
	 */
	public WithClientCallbackMiddleware<TNewParams extends ReadonlyArray<unknown> = TParams>(
		...middlewares: ReadonlyArray<ClientCallbackMiddleware<TNewParams, TParams>>
	): EventBuilder<TNewParams> {
		for (const middleware of middlewares) {
			this.clientCallbackMiddleware.push(middleware as never);
		}
		return this as never;
	}

	/**
	 * Adds server callback middleware to this remote
	 * @param middlewares The server callback middleware to add
	 */
	public WithServerCallbackMiddleware<TNewParams extends ReadonlyArray<unknown> = TParams>(
		...middlewares: ReadonlyArray<ServerCallbackMiddleware<TNewParams, TParams>>
	): EventBuilder<TNewParams> {
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
	 * @internal
	 */
	public OnServer(): ServerToClientEventDeclaration<TParams> {
		return {
			Type: "Event",
			ServerMiddleware: this.serverCallbackMiddleware,
			ClientMiddleware: this.clientCallbackMiddleware,
			Unreliable: this.useUnreliable,
		} as ServerToClientEventDeclaration<TParams>;
	}

	/**
	 * @internal
	 */
	public OnClient(): ClientToServerEventDeclaration<TParams> {
		return {
			Type: "Event",
			ServerMiddleware: this.serverCallbackMiddleware,
			ClientMiddleware: this.clientCallbackMiddleware,
			Unreliable: this.useUnreliable,
		} as ClientToServerEventDeclaration<TParams>;
	}
}

new EventBuilder().WithArgumentTypes(t.string).WhichReturnsAsync(t.string).OnServer();
