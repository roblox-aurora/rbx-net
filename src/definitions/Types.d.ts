/**
 * Types
 *
 * I will admit, this is a lot of type spaghetti. It makes the definitions work good though. :D
 */
import { interface } from "@rbxts/t";
import ClientAsyncFunction from "../client/ClientAsyncFunction";
import ClientEvent, { ClientListenerEvent, ClientSenderEvent } from "../client/ClientEvent";
import ClientFunction from "../client/ClientFunction";
import { MiddlewareOverload } from "../middleware";
import ServerAsyncFunction from "../server/ServerAsyncFunction";
import ServerEvent, { ServerListenerEvent, ServerSenderEvent } from "../server/ServerEvent";
import ServerFunction from "../server/ServerFunction";
import { ClientDefinitionBuilder } from "./ClientDefinitionBuilder";
import { ServerDefinitionBuilder } from "./ServerDefinitionBuilder";

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

/**
 * The DefinitionBuilders type
 */
export interface DefinitionsCreateResult<T extends RemoteDeclarations> {
	readonly Server: ServerDefinitionBuilder<T>;
	readonly Client: ClientDefinitionBuilder<T>;
}

export type DeclarationType<T extends DefinitionsCreateResult<any>> = T extends DefinitionsCreateResult<infer D>
	? D
	: never;

export type InferGroupDeclaration<T> = T extends DeclarationGroupLike ? T["Definitions"] : {};

export type DeclarationsOf<
	T extends RemoteDeclarations,
	U extends
		| EventDeclarationLike
		| FunctionDeclarationLike
		| AsyncFunctionDeclarationLike
		| ServerEventDeclaration<any>
		| ClientEventDeclaration<any>
> = {
	[K in ExtractKeys<T, U>]: T[K];
};

export type FilterGroups<T extends RemoteDeclarations> = {
	[K in ExtractKeys<T, DeclarationGroupLike>]: T[K];
};

export type FilterDeclarations<T extends RemoteDeclarations> = {
	[K in ExtractKeys<T, EventDeclarationLike | FunctionDeclarationLike | AsyncFunctionDeclarationLike>]: T[K];
};

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

/** @deprecated */
export interface LegacyEventDeclaration<ServerArgs extends readonly unknown[], ClientArgs extends readonly unknown[]>
	extends EventDeclarationLike {
	ServerMiddleware: [...mw: MiddlewareOverload<ServerArgs>];
	ClientArguments: Checks<ClientArgs>;
}

export interface ClientEventDeclaration<ClientArgs extends readonly unknown[]> extends EventDeclarationLike {
	ServerMiddleware: [];
	ClientArguments: Checks<ClientArgs>;
	readonly _nominal_Client: unique symbol;
}

export interface ServerEventDeclaration<ServerArgs extends readonly unknown[]> extends EventDeclarationLike {
	ServerMiddleware: [...mw: MiddlewareOverload<ServerArgs>];
	readonly _nominal_Server: unique symbol;
}

export interface DeclarationGroupLike {
	Type: "Group";
	Definitions: RemoteDeclarations;

	// Just to get it to stop complaining
	ServerMiddleware?: never;
}

export interface DeclarationGroup<T extends RemoteDeclarations> extends DeclarationGroupLike {
	Type: "Group";
	Definitions: T;

	// Just to get it to stop complaining
	ServerMiddleware?: never;
}
export type DeclarationLike = FunctionDeclarationLike | AsyncFunctionDeclarationLike | EventDeclarationLike;
export type RemoteDeclarations = Record<string, DeclarationLike | DeclarationGroupLike>;

////////////////////////////////
// * Checks
///////////////////////////////

export type CheckLike = (value: unknown) => boolean;
export type Check<T> = (value: unknown) => value is T;
export type Checks<Tuple extends readonly [...unknown[]]> = { [Index in keyof Tuple]: Check<Tuple[Index]> };
export type CheckMap<T> = { [P in keyof T]: Check<T[P]> };

type CheckTupleToInferedValues<Tuple extends readonly [...defined[]]> = {
	[Index in keyof Tuple]: InferCheck<Tuple[Index]>;
};

////////////////////////////////
// * Inference Magic
///////////////////////////////

export type InferServerConnect<T> = T extends ClientEventDeclaration<infer A> ? (...args: A) => void : never;
export type InferClientConnect<T> = T extends ServerEventDeclaration<infer A> ? (...args: A) => void : never;

export type InferClientCallback<T> = T extends AsyncFunctionDeclaration<any, any, infer A, infer R>
	? (...args: A) => R
	: never;
export type InferServerCallback<T> = T extends AsyncFunctionDeclaration<infer A, infer R, any, any>
	? (...args: A) => R
	: never;

type InferCheck<T> = T extends (value: unknown) => value is infer A ? A : unknown;

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
	? ClientAsyncFunction<
			InferArgs<T["ClientArguments"]>,
			A,
			InferArgs<T["ServerReturns"]>,
			InferArgs<T["ClientReturns"]>
	  >
	: ClientAsyncFunction<InferArgs<T["ClientArguments"]>, unknown[], InferArgs<T["ServerReturns"]>>;

type InferServerFunction<T extends FunctionDeclarationLike> = T["ServerMiddleware"] extends [
	...mw: MiddlewareOverload<infer A>
]
	? ServerFunction<A, InferArgs<T["ServerReturns"]>>
	: ServerFunction<unknown[], InferArgs<T["ServerReturns"]>>;

type InferServerAsyncFunction<T extends AsyncFunctionDeclarationLike> = T["ServerMiddleware"] extends [
	...mw: MiddlewareOverload<infer A>
]
	? ServerAsyncFunction<
			A,
			InferArgs<T["ClientArguments"]>,
			InferArgs<T["ClientReturns"]>,
			InferArgs<T["ServerReturns"]>
	  >
	: ServerAsyncFunction<unknown[], InferArgs<T["ClientArguments"]>, InferArgs<T["ClientReturns"]>>;

export type InferClientRemote<T> = T extends FunctionDeclarationLike
	? InferClientFunction<T>
	: T extends AsyncFunctionDeclarationLike
	? InferClientAsyncFunction<T>
	: T extends ClientEventDeclaration<infer A>
	? ClientSenderEvent<A>
	: T extends ServerEventDeclaration<infer A>
	? ClientListenerEvent<A>
	: T extends EventDeclarationLike
	? InferClientEvent<T>
	: never;
export type InferServerRemote<T> = T extends FunctionDeclarationLike
	? InferServerFunction<T>
	: T extends AsyncFunctionDeclarationLike
	? InferServerAsyncFunction<T>
	: T extends ClientEventDeclaration<infer A>
	? ServerListenerEvent<A>
	: T extends ServerEventDeclaration<infer A>
	? ServerSenderEvent<A>
	: T extends EventDeclarationLike
	? InferServerEvent<T>
	: never;

/////////////////////////////////////////
// * Results
/////////////////////////////////////////

export type ClientBuildResult<T extends RemoteDeclarations> = { [P in keyof T]: InferClientRemote<T[P]> };
export type ServerBuildResult<T extends RemoteDeclarations> = { [P in keyof T]: InferServerRemote<T[P]> };
