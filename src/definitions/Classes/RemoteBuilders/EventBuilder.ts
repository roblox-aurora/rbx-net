import { ServerCallbackMiddleware, createTypeChecker } from "../../../middleware";
import createRateLimiter, { RateLimitOptions } from "../../../middleware/RateLimitMiddleware";
import { ToCheck } from "../../../middleware/TypeCheckMiddleware/types";
import { ClientToServerEventDeclaration, ServerToClientEventDeclaration } from "../../Types";
import { RemoteBuilder } from "./RemoteBuilder";

export class EventBuilder<TParams extends readonly unknown[] = unknown[]> extends RemoteBuilder<
	ServerToClientEventDeclaration<TParams>,
	ClientToServerEventDeclaration<TParams>
> {
	private useUnreliable = false;

	public EnsureArguments<T extends readonly unknown[]>(...typeChecks: ToCheck<T>) {
		return this.WithServerCallbackMiddleware(createTypeChecker(...typeChecks) as never) as EventBuilder<T>;
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
