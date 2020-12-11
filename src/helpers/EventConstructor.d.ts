import { NetMiddleware } from "../middleware";

export type MiddlewareOverload<T extends readonly unknown[]> =
	| []
	| [NetMiddleware<T>]
	| [NetMiddleware, NetMiddleware<T>]
	| [NetMiddleware, NetMiddleware, NetMiddleware, NetMiddleware<T>]
	| [NetMiddleware, NetMiddleware, NetMiddleware, NetMiddleware, NetMiddleware<T>]
	| [NetMiddleware, NetMiddleware, NetMiddleware, NetMiddleware, NetMiddleware, NetMiddleware<T>];
