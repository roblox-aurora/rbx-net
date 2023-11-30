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

export class UnreliableEventBuilder<TParams extends ReadonlyArray<unknown> = Array<unknown>> extends RemoteBuilder<
	ServerToClientEventDeclaration<TParams>,
	ClientToServerEventDeclaration<TParams>
> {
	/**
	 * Sets the argument types for this remote
	 * @param typeChecks The argument checks for this remote
	 */
	public WithArgumentTypes<T extends ReadonlyArray<unknown>>(...typeChecks: ToCheck<T>): UnreliableEventBuilder<T> {
		return this.WithServerCallbackMiddleware(
			createTypeChecker(...typeChecks) as never,
		) as UnreliableEventBuilder<T>;
	}

	/**
	 * Adds client callback middleware to this remote
	 * @param middlewares The server callback middleware to add
	 */
	public WithClientCallbackMiddleware<TNewParams extends ReadonlyArray<unknown> = TParams>(
		...middlewares: ReadonlyArray<ClientCallbackMiddleware<TNewParams, TParams>>
	): UnreliableEventBuilder<TNewParams> {
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
	): UnreliableEventBuilder<TNewParams> {
		for (const middleware of middlewares) {
			this.serverCallbackMiddleware.push(middleware as never);
		}
		return this as never;
	}

	/**
	 * @internal
	 */
	public OnServer(): ServerToClientEventDeclaration<TParams> {
		return {
			Type: "Event",
			ServerMiddleware: this.serverCallbackMiddleware,
			ClientMiddleware: this.clientCallbackMiddleware,
			Unreliable: true,
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
			Unreliable: true,
		} as ClientToServerEventDeclaration<TParams>;
	}
}
