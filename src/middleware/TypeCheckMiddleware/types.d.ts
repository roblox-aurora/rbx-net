import { NetManagedInstance } from "../../internal";
import { NetMiddleware } from "..";

type CheckLike<T> = (value: unknown) => value is T;
type InferValue<T> = T extends CheckLike<infer A> ? A : never;
type Convert<T> = { [K in keyof T]: InferValue<T[K]> };
export interface TypeCheckerOptions {
	ErrorHandler?: ErrorHandler;
}

export interface NetTypeCheckerMiddleware<T extends Array<unknown>> extends NetMiddleware<Convert<T>> {
	WithErrorHandler(errorHandler: ErrorHandler): NetMiddleware<Convert<T>>;
}

export interface TypeChecking {
	/**
	 * Creates an argument type checker
	 */
	<T extends Array<CheckLike<any>>>(...checks: T): NetTypeCheckerMiddleware<T>;

	/**
	 * Sets the default error handler used by _all_ instances
	 * of the type checker middleware that isn't using it's own custom error handler
	 */
	SetDefaultErrorHandler(errorHandler: ErrorHandler): void;
}

export interface ErrorHandler {
	(event: NetManagedInstance, args: defined[], index: number): void;
}
