import { ServerCallbackMiddleware, createTypeChecker } from "../../middleware";
import createRateLimiter, { RateLimitOptions } from "../../middleware/RateLimitMiddleware";
import { ToCheck } from "../../middleware/TypeCheckMiddleware/types";
import { ClientToServerEventDeclaration, ServerToClientEventDeclaration } from "../Types";
import { RemoteBuilder } from "./RemoteBuilder";

export class EventBuilder<TParams extends readonly unknown[] = unknown[]> extends RemoteBuilder<
	ServerToClientEventDeclaration<TParams>,
	ClientToServerEventDeclaration<TParams>
> {
	public EnsureArguments<T extends readonly unknown[]>(...typeChecks: ToCheck<T>) {
		return this.WithServerCallbackMiddleware(createTypeChecker(...typeChecks) as never) as EventBuilder<T>;
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
		} as ServerToClientEventDeclaration<TParams>;
	}

	public OnClient(): ClientToServerEventDeclaration<TParams> {
		return {
			Type: "Event",
			ServerMiddleware: this.serverCallbackMiddleware,
		} as ClientToServerEventDeclaration<TParams>;
	}
}
