import { NetManagedInstance } from "../../internal";
import { NetMiddleware } from "..";

type CheckLike<T> = (value: unknown) => value is T;
type InferValue<T> = T extends CheckLike<infer A> ? A : never;
type Convert<T> = { [K in keyof T]: InferValue<T[K]> };

export type TypeCheckMiddleware<T extends Array<unknown>> = NetMiddleware<Convert<T>>;

export interface TypeCheckerOptions {
	ErrorHandler?: ErrorHandler;
}

export interface TypeCheckerConstructor {
	<T extends Array<CheckLike<any>>>(...checks: T): TypeCheckMiddleware<T>;
	new (options?: TypeCheckerOptions): CustomTypeChecker;
}

export interface ErrorHandler {
	(event: NetManagedInstance, args: defined[], index: number): void;
}

export class CustomTypeChecker {
	/**
	 * Sets the error handler for any Checkers.
	 * @param handler The error handler
	 */
	public SetErrorHandler(handler: ErrorHandler): void;

	/**
	 * Same as `Net.Middleware.TypeChecking(...)` but with the applied options
	 * @param checks The checks to check against
	 */
	public Check<T extends Array<CheckLike<any>>>(...checks: T): TypeCheckMiddleware<T>;
}
