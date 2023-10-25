import { ServerCallbackMiddleware, createTypeChecker } from "../../../middleware";
import createRateLimiter, { RateLimitOptions } from "../../../middleware/RateLimitMiddleware";
import { ToCheck } from "../../../middleware/TypeCheckMiddleware/types";
import {
	BidirectionalEventDeclaration,
	ClientToServerEventDeclaration,
	ServerToClientEventDeclaration,
} from "../../Types";
import { RemoteBuilder } from "./RemoteBuilder";

export class EventBuilder<
	TServerParams extends readonly unknown[] = unknown[],
	TClientParams extends readonly unknown[] = unknown[]
> extends RemoteBuilder<
	BidirectionalEventDeclaration<TServerParams, TClientParams>,
	BidirectionalEventDeclaration<TServerParams, TClientParams>
> {
	public EnsureServerArguments<T extends readonly unknown[]>(...typeChecks: ToCheck<T>) {
		return this.WithServerCallbackMiddleware(createTypeChecker(...typeChecks) as never) as EventBuilder<T>;
	}

	public EnsureClientArguments<T extends readonly unknown[]>(...typeChecks: ToCheck<T>) {
		return this.WithServerCallbackMiddleware(createTypeChecker(...typeChecks) as never) as EventBuilder<T>;
	}

	public WithClientCallbackMiddleware<TNewParams extends readonly unknown[] = TServerParams>(
		...middlewares: readonly ServerCallbackMiddleware<TNewParams, TServerParams>[]
	): EventBuilder<TNewParams> {
		for (const middleware of middlewares) {
			this.serverCallbackMiddleware.push(middleware as never);
		}
		return this as never;
	}

	public WithServerCallbackMiddleware<TNewParams extends readonly unknown[] = TServerParams>(
		...middlewares: readonly ServerCallbackMiddleware<TNewParams, TServerParams>[]
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

	public OnServer(): BidirectionalEventDeclaration<TServerParams, TClientParams> {
		return {
			Type: "Event",
			ServerMiddleware: this.serverCallbackMiddleware,
		} as BidirectionalEventDeclaration<TServerParams, TClientParams>;
	}

	public OnClient(): BidirectionalEventDeclaration<TServerParams, TClientParams> {
		return {
			Type: "Event",
			ServerMiddleware: this.serverCallbackMiddleware,
		} as BidirectionalEventDeclaration<TServerParams, TClientParams>;
	}
}
