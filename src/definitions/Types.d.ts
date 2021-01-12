/**
 * Types
 *
 * I will admit, this is a lot of type spaghetti. It makes the definitions work good though. :D
 */
import ClientAsyncFunction from "../client/ClientAsyncFunction";
import ClientEvent from "../client/ClientEvent";
import ClientFunction from "../client/ClientFunction";
import { MiddlewareOverload } from "../helpers/EventConstructor";
import ServerAsyncFunction from "../server/ServerAsyncFunction";
import ServerEvent from "../server/ServerEvent";
import ServerFunction from "../server/ServerFunction";

export interface FunctionDeclarationLike {
	/**
	 * @deprecated
	 * @internal Do not use, used to force using the creators
	 */
	readonly _nominal_FunctionDeclaration: unique symbol;

	Type: "Function";
	ServerMiddleware?: [...mw: MiddlewareOverload<any>];
	ServerReturns?: CheckLike;
}
export interface FunctionDeclaration<T extends readonly unknown[], R extends unknown = undefined>
	extends FunctionDeclarationLike {
	ServerMiddleware: [...mw: MiddlewareOverload<T>];
	ServerReturns: Check<R>;
}

export interface AsyncFunctionDeclarationLike {
	/**
	 * @deprecated
	 * @internal Do not use, used to force using the creators
	 */
	readonly _nominal_AsyncFunctionDeclaration: unique symbol;

	Type: "AsyncFunction";
	ServerMiddleware?: [...mw: MiddlewareOverload<any>];
	ServerReturns?: CheckLike;
	ClientArguments?: ReadonlyArray<CheckLike>;
	ClientReturns?: CheckLike;
}
export interface AsyncFunctionDeclaration<
	ServerArgs extends readonly unknown[],
	ServerReturn extends unknown,
	ClientArgs extends readonly unknown[],
	ClientReturn extends unknown
> extends AsyncFunctionDeclarationLike {
	ServerMiddleware: [...mw: MiddlewareOverload<ServerArgs>];
	ServerReturns: Check<ServerReturn>;
	ClientReturns: Check<ClientReturn>;
	ClientArguments: Checks<ClientArgs>;
}

export interface EventDeclarationLike {
	/**
	 * @deprecated
	 * @internal Do not use, used to force using the creators
	 */
	readonly _nominal_EventDeclaration: unique symbol;

	Type: "Event";
	ServerMiddleware?: [...mw: MiddlewareOverload<any>];
	ClientArguments?: ReadonlyArray<CheckLike>;
}

export interface EventDeclaration<ServerArgs extends readonly unknown[], ClientArgs extends readonly unknown[]>
	extends EventDeclarationLike {
	ServerMiddleware: [...mw: MiddlewareOverload<ServerArgs>];
	ClientArguments: Checks<ClientArgs>;
}

type RemoteDeclarations = Record<string, FunctionDeclarationLike | EventDeclarationLike | AsyncFunctionDeclarationLike>;

export type InferServerConnect<T> = T extends EventDeclaration<infer A, any> ? (...args: A) => void : never;
export type InferClientConnect<T> = T extends EventDeclaration<any, infer A> ? (...args: A) => void : never;

export type CheckLike = (value: unknown) => boolean;
export type Check<T> = (value: unknown) => value is T;
export type Checks<Tuple extends readonly [...unknown[]]> = { [Index in keyof Tuple]: Check<Tuple[Index]> };
export type CheckMap<T> = { [P in keyof T]: Check<T[P]> };
type InferCheck<T> = T extends (value: unknown) => value is infer A ? A : unknown;
type CheckTupleToInferedValues<Tuple extends readonly [...defined[]]> = {
	[Index in keyof Tuple]: InferCheck<Tuple[Index]>;
};
type InferArgs<T extends readonly CheckLike[] | CheckLike | undefined> = T extends readonly [...CheckLike[]]
	? CheckTupleToInferedValues<T>
	: T extends CheckLike
	? InferCheck<T>
	: unknown[];

type InferServerEvent<T extends EventDeclarationLike> = T["ServerMiddleware"] extends [
	...mw: MiddlewareOverload<infer A>
]
	? ServerEvent<A, InferArgs<T["ClientArguments"]>>
	: ServerEvent<unknown[], InferArgs<T["ClientArguments"]>>;

type InferClientEvent<T extends EventDeclarationLike> = T["ServerMiddleware"] extends [
	...mw: MiddlewareOverload<infer A>
]
	? ClientEvent<InferArgs<T["ClientArguments"]>, A>
	: ClientEvent<InferArgs<T["ClientArguments"]>, unknown[]>;

type InferClientFunction<T extends FunctionDeclarationLike> = T["ServerMiddleware"] extends [
	...mw: MiddlewareOverload<infer A>
]
	? ClientFunction<A, InferArgs<T["ServerReturns"]>>
	: ClientFunction<unknown[], InferArgs<T["ServerReturns"]>>;

type InferClientAsyncFunction<T extends AsyncFunctionDeclarationLike> = T["ServerMiddleware"] extends [
	...mw: MiddlewareOverload<infer A>
]
	? ClientAsyncFunction<InferArgs<T["ClientArguments"]>, A, InferArgs<T["ServerReturns"]>>
	: ClientAsyncFunction<InferArgs<T["ClientArguments"]>, unknown[], InferArgs<T["ServerReturns"]>>;

type InferServerFunction<T extends FunctionDeclarationLike> = T["ServerMiddleware"] extends [
	...mw: MiddlewareOverload<infer A>
]
	? ServerFunction<A, InferArgs<T["ServerReturns"]>>
	: ServerFunction<unknown[], InferArgs<T["ServerReturns"]>>;

type InferServerAsyncFunction<T extends AsyncFunctionDeclarationLike> = T["ServerMiddleware"] extends [
	...mw: MiddlewareOverload<infer A>
]
	? ServerAsyncFunction<A, InferArgs<T["ClientArguments"]>, InferArgs<T["ClientReturns"]>>
	: ServerAsyncFunction<unknown[], InferArgs<T["ClientArguments"]>, InferArgs<T["ClientReturns"]>>;

export type InferClientRemote<T> = T extends FunctionDeclarationLike
	? InferClientFunction<T>
	: T extends AsyncFunctionDeclarationLike
	? InferClientAsyncFunction<T>
	: T extends EventDeclarationLike
	? InferClientEvent<T>
	: never;
export type InferServerRemote<T> = T extends FunctionDeclarationLike
	? InferServerFunction<T>
	: T extends AsyncFunctionDeclarationLike
	? InferServerAsyncFunction<T>
	: T extends EventDeclarationLike
	? InferServerEvent<T>
	: never;

/////////////////////////////////////////
// Building
/////////////////////////////////////////

export type ClientBuildResult<T extends RemoteDeclarations> = { [P in keyof T]: InferClientRemote<T[P]> };
export type ServerBuildResult<T extends RemoteDeclarations> = { [P in keyof T]: InferServerRemote<T[P]> };
