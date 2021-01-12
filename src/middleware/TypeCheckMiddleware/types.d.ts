import { NetManagedInstance } from "../../internal";
import { NetMiddleware } from "..";

type CheckLike<T> = (value: unknown) => value is T;
type InferValue<T> = T extends CheckLike<infer A> ? A : never;
type Convert<T> = { [K in keyof T]: InferValue<T[K]> };

export type TypeCheckMiddleware<T extends Array<unknown>> = NetMiddleware<Convert<T>>;

export interface TypeCheckerConstructor {
	<T extends Array<CheckLike<any>>>(...checks: T): TypeCheckMiddleware<T>;
	new (): TypeCheckerBuilder;
}

export interface ErrorHandler {
	(event: NetManagedInstance, args: defined[], index: number): void;
}

export class TypeCheckerBuilder {
	public SetErrorHandler(handler: ErrorHandler): void;
	public For<T extends Array<CheckLike<any>>>(...checks: T): TypeCheckMiddleware<T>;
}
