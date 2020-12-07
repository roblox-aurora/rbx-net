import { Middleware } from "../middleware";

export type MiddlewareOverload<T extends readonly unknown[]> =
	| []
	| [Middleware<T>]
	| [Middleware, Middleware<T>]
	| [Middleware, Middleware, Middleware, Middleware<T>]
	| [Middleware, Middleware, Middleware, Middleware, Middleware<T>]
	| [Middleware, Middleware, Middleware, Middleware, Middleware, Middleware<T>];
