import { ClientCallbackMiddleware, ServerCallbackMiddleware, createTypeChecker } from "../../../middleware";
import createRateLimiter, { RateLimitOptions } from "../../../middleware/RateLimitMiddleware";
import { ToCheck } from "../../../middleware/TypeCheckMiddleware/types";
import { ClientToServerEventDeclaration, ServerToClientEventDeclaration } from "../../Types";
import { AsyncFunctionBuilder } from "./AsyncFunctionBuilder";
import { RemoteBuilder } from "./RemoteBuilder";

export class EventBuilder<TParams extends readonly unknown[] = unknown[]> extends RemoteBuilder<
	ServerToClientEventDeclaration<TParams>,
	ClientToServerEventDeclaration<TParams>
> {
	private useUnreliable = false;

	public EnsureArguments<T extends readonly unknown[]>(...typeChecks: ToCheck<T>) {
		return this.WithServerCallbackMiddleware(createTypeChecker(...typeChecks) as never) as EventBuilder<T>;
	}

	public ReturnsAsync() {
		const builder = new AsyncFunctionBuilder<TParams, unknown>();
		builder.serverCallbackMiddleware = this.serverCallbackMiddleware;
		return builder;
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

	public WithClientCallbackMiddleware<TNewParams extends readonly unknown[] = TParams>(
		...middlewares: readonly ClientCallbackMiddleware<TNewParams, TParams>[]
	): EventBuilder<TNewParams> {
		for (const middleware of middlewares) {
			this.clientCallbackMiddleware.push(middleware as never);
		}
		return this as never;
	}

	public WithServerCallbackMiddleware<TNewParams extends readonly unknown[] = TParams>(
		...middlewares: readonly ServerCallbackMiddleware<TNewParams, TParams>[]
	): EventBuilder<TNewParams> {
		for (const middleware of middlewares) {
			this.serverCallbackMiddleware.push(middleware as never);
		}
		return this as never;
	}

	public WithRateLimit(options: RateLimitOptions) {
		this.serverCallbackMiddleware.push(createRateLimiter(options));
		return this;
	}

	public OnServer(): ServerToClientEventDeclaration<TParams> {
		return {
			Type: "Event",
			ServerMiddleware: this.serverCallbackMiddleware,
			Unreliable: this.useUnreliable,
		} as ServerToClientEventDeclaration<TParams>;
	}

	public OnClient(): ClientToServerEventDeclaration<TParams> {
		return {
			Type: "Event",
			ServerMiddleware: this.serverCallbackMiddleware,
			Unreliable: this.useUnreliable,
		} as ClientToServerEventDeclaration<TParams>;
	}
}
