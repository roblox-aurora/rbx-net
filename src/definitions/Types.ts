/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Types
 *
 * I will admit, this is a lot of type spaghetti. It makes the definitions work good though. :D
 */
import { oneOf } from "../internal/validator";
import ClientAsyncFunction, { ClientAsyncCallback, ClientAsyncCaller } from "../client/ClientAsyncFunction";
import ClientEvent, { ClientListenerEvent, ClientSenderEvent } from "../client/ClientEvent";
import ClientFunction from "../client/ClientFunction";
import { ClientCallbackMiddleware, MiddlewareOverload, ServerCallbackMiddleware } from "../middleware";
import ServerAsyncFunction, { ServerAsyncCallback, ServerAsyncCaller } from "../server/ServerAsyncFunction";
import ServerEvent, { ServerListenerEvent, ServerSenderEvent } from "../server/ServerEvent";
import ServerFunction from "../server/ServerFunction";
import { ClientRemoteContext } from "./Classes/ClientRemoteContext";
import { ServerRemoteContext } from "./Classes/ServerRemoteContext";
import { NamespaceGenerator } from "./Classes/NamespaceGenerator";
import ExperienceBroadcastEvent from "../messaging/ExperienceBroadcastEvent";
import ServerMessagingEvent from "../server/ServerMessagingEvent";
import { NetDuration } from "../duration";

export type Identity<T> = T extends object
	? {} & {
			[P in keyof T]: T[P];
	  }
	: T;

export interface FunctionDeclarationLike {
	/**
	 * @deprecated
	 */
	readonly _nominal_FunctionDeclarationLike: unique symbol;

	/** @internal */
	readonly Type: "Function";
	/** @internal */
	readonly ServerMiddleware?: [...mw: MiddlewareOverload<any>];
}

export interface ExperienceEventDeclarationLike {
	/**
	 * @deprecated
	 */
	readonly _nominal_ExperienceEventDeclarationLike: unique symbol;

	/** @internal */
	readonly Type: "ExperienceEvent";
}

export interface MessagingEventDeclarationLike {
	/**
	 * @deprecated
	 */
	readonly _nominal_MessagingDeclarationLike: unique symbol;

	/** @internal */
	readonly Type: "Messaging";
}

export interface EventDeclarationLike {
	/**
	 * @deprecated
	 */
	readonly _nominal_EventDeclarationLike: unique symbol;

	/** @internal */
	readonly Type: "Event";

	/** @internal */
	readonly ServerMiddleware?: Array<ServerCallbackMiddleware>;

	/** @internal */
	readonly ClientMiddleware?: Array<ClientCallbackMiddleware>;

	/** @internal */
	readonly Unreliable: boolean;
}

export interface FunctionCacheOptions {
	readonly CacheTime: NetDuration;
}

export interface AsyncFunctionDeclarationLike {
	/**
	 * @deprecated
	 */
	readonly _nominal_AsyncFunctionDeclarationLike: unique symbol;

	/** @internal */
	readonly Type: "AsyncFunction";

	/** @internal */
	readonly ClientMiddleware?: Array<ClientCallbackMiddleware>;

	/** @internal */
	readonly ServerMiddleware?: Array<ServerCallbackMiddleware>;

	readonly CacheOptions?: FunctionCacheOptions;
}

export interface FunctionDeclaration<T extends ReadonlyArray<unknown>, R = undefined> extends FunctionDeclarationLike {
	/** @deprecated */
	readonly _nominal_FunctionDeclaration: unique symbol;
}

/**
 * The DefinitionBuilders type
 */
export interface RemoteContexts<T extends RemoteDeclarations> {
	/**
	 * The server namespace for this definitions file, which allows manipulating remotes from the server
	 * @server
	 */
	readonly Server: ServerRemoteContext<T>;

	/**
	 * The client namespace for this definitions file, which allows manipulating remotes from the client
	 * @client
	 */
	readonly Client: ClientRemoteContext<T>;
}

export type InferGroupDeclaration<T> = T extends DeclarationNamespaceLike ? T["Namespace"] : {};

export type DeclarationsOf<
	T extends RemoteDeclarations,
	U extends
		| EventDeclarationLike
		| FunctionDeclarationLike
		| AsyncFunctionDeclarationLike
		| AsyncClientFunctionDeclaration<any, any>
		| AsyncServerFunctionDeclaration<any, any>
		| ServerToClientEventDeclaration<any>
		| ClientToServerEventDeclaration<any>
		| BidirectionalEventDeclaration<any, any>,
> = {
	[K in ExtractKeys<T, U>]: T[K];
};

export type FilterGroups<T extends RemoteDeclarations> = {
	[K in ExtractKeys<T, DeclarationNamespaceLike>]: T[K];
};

export type FilterServerDeclarations<T extends RemoteDeclarations> = {
	[K in ExtractKeys<
		T,
		| EventDeclarationLike
		| MessagingEventDeclarationLike
		| ExperienceEventDeclarationLike
		| FunctionDeclarationLike
		| AsyncFunctionDeclarationLike
	>]: T[K];
};

export type FilterClientDeclarations<T extends RemoteDeclarations> = {
	[K in ExtractKeys<
		T,
		EventDeclarationLike | FunctionDeclarationLike | ExperienceEventDeclarationLike | AsyncFunctionDeclarationLike
	>]: T[K];
};

/**
 * @deprecated
 */
export interface LegacyAsyncFunctionDeclaration<
	_ServerArgs extends ReadonlyArray<unknown>,
	_ServerReturn,
	_ClientArgs extends ReadonlyArray<unknown>,
	_ClientReturn,
> extends AsyncFunctionDeclarationLike {
	/** @deprecated */
	readonly _nominal_LegacyAsyncFunctionDeclaration: unique symbol;
}

/**
 * A declaration for an async client function
 */
export interface AsyncClientFunctionDeclaration<_ClientArgs extends ReadonlyArray<unknown>, _ClientReturn>
	extends AsyncFunctionDeclarationLike {
	/**
	 * @deprecated
	 */
	readonly _nominal_AsyncClientFunction: unique symbol;
}

/**
 * A declaration for an async server function
 */
export interface AsyncServerFunctionDeclaration<_ServerArgs extends ReadonlyArray<unknown>, _ServerReturn>
	extends AsyncFunctionDeclarationLike {
	/**
	 * @deprecated
	 */
	readonly _nominal_AsyncServerFunction: unique symbol;
}

/** @deprecated */
export interface LegacyEventDeclaration<
	_ServerArgs extends ReadonlyArray<unknown>,
	_ClientArgs extends ReadonlyArray<unknown>,
> extends EventDeclarationLike {
	/** @deprecated */
	readonly _nominal_LegacyEventDeclaration: unique symbol;
}

/**
 * A declaration for a client -> server event
 */
export interface ClientToServerEventDeclaration<_ClientArgs extends ReadonlyArray<unknown>>
	extends EventDeclarationLike {
	/** @deprecated */
	readonly _nominal_ClientToServerEvent: unique symbol;
}

/**
 * A declaration for a server -> client event
 */
export interface ServerToClientEventDeclaration<_ServerArgs extends ReadonlyArray<unknown>>
	extends EventDeclarationLike {
	/** @deprecated */
	readonly _nominal_ServerToClientEvent: unique symbol;
}

/**
 * A declaration for a server -> server event
 */
export interface ExperienceBroadcastEventDeclaration<_ServerArgs> extends MessagingEventDeclarationLike {
	/** @deprecated */
	readonly _nominal_ExperienceBroadcastEvent: unique symbol;
}

/**
 * A declaration for a server -> server event, that replicates to clients
 */
export interface ExperienceReplicatingEventDeclaration<_ServerArgs extends ReadonlyArray<unknown>>
	extends ExperienceEventDeclarationLike {
	/** @deprecated */
	readonly _nominal_ExperienceReplicatingEvent: unique symbol;
}

/**
 * A declaration for a Bidirectional event
 */
export interface BidirectionalEventDeclaration<
	_ServerArgs extends ReadonlyArray<unknown>,
	_ClientArgs extends ReadonlyArray<unknown>,
> extends EventDeclarationLike {
	/** @deprecated */
	readonly _nominal_Bidirectional: unique symbol;
}

export interface DeclarationNamespaceLike {
	/** @deprecated */
	readonly _nominal_DeclarationGroupLike: unique symbol;
	/** @internal */
	readonly Type: "Namespace";
	/** @internal */
	readonly Namespace: NamespaceGenerator<RemoteDeclarations>;
}

/**
 * A declaration group
 */
export interface NamespaceDeclaration<T extends RemoteDeclarations> extends DeclarationNamespaceLike {
	/** @deprecated */
	readonly _nominal_DeclarationGroup: unique symbol;

	/** @internal */
	readonly Type: "Namespace";
	/** @internal */
	readonly Namespace: NamespaceGenerator<T>;
}
export type DeclarationLike =
	| FunctionDeclarationLike
	| MessagingEventDeclarationLike
	| AsyncFunctionDeclarationLike
	| EventDeclarationLike
	| ExperienceEventDeclarationLike;
export type RemoteDeclarations = Record<string, DeclarationLike | DeclarationNamespaceLike>;

export type Constructor<T extends object = object> = new (...args: Array<any>) => T;
export type Prototype<T extends Constructor> = T extends Constructor<infer R> ? R : never;

////////////////////////////////
// * Inference Magic
///////////////////////////////

export type InferServerConnect<T> = T extends ClientToServerEventDeclaration<infer A>
	? (player: Player, ...args: A) => void
	: T extends BidirectionalEventDeclaration<infer S, infer _>
	? (player: Player, ...args: S) => void
	: never;
export type InferClientConnect<T> = T extends ServerToClientEventDeclaration<infer A>
	? (...args: A) => void
	: T extends BidirectionalEventDeclaration<infer _, infer C>
	? (...args: C) => void
	: never;

export type InferClientCallback<T> = T extends LegacyAsyncFunctionDeclaration<any, any, infer A, infer R>
	? (...args: A) => R
	: T extends AsyncClientFunctionDeclaration<infer A, infer R>
	? (...args: A) => R
	: never;
export type InferServerCallback<T> = T extends LegacyAsyncFunctionDeclaration<infer A, infer R, any, any>
	? (player: Player, ...args: A) => R
	: T extends AsyncServerFunctionDeclaration<infer A, infer R>
	? ((player: Player, ...args: A) => R) | ((player: Player, ...args: A) => Promise<R>)
	: never;

/**
 * This infers the client remote type based on the given value
 */
export type InferClientRemote<T> = T extends AsyncClientFunctionDeclaration<infer A, infer R>
	? ClientAsyncCallback<A, R>
	: T extends AsyncServerFunctionDeclaration<infer A, infer R>
	? ClientAsyncCaller<A, R>
	: T extends ClientToServerEventDeclaration<infer A>
	? ClientSenderEvent<A>
	: T extends ServerToClientEventDeclaration<infer A>
	? ClientListenerEvent<A>
	: T extends BidirectionalEventDeclaration<infer S, infer C>
	? ClientEvent<C, S>
	: T extends LegacyEventDeclaration<infer SA, infer CA>
	? ClientEvent<CA, SA>
	: T extends LegacyAsyncFunctionDeclaration<infer SA, infer SR, infer CA, infer CR>
	? ClientAsyncFunction<CA, SA, CR, SR>
	: T extends FunctionDeclaration<infer SA, infer SR>
	? ClientFunction<SA, SR>
	: T extends ExperienceReplicatingEventDeclaration<infer A>
	? ClientListenerEvent<A>
	: never;

/**
 * This infers the server remote type based on the given value
 */
export type InferServerRemote<T> = T extends AsyncClientFunctionDeclaration<infer A, infer R>
	? ServerAsyncCaller<A, R>
	: T extends AsyncServerFunctionDeclaration<infer A, infer R>
	? ServerAsyncCallback<A, R>
	: T extends ClientToServerEventDeclaration<infer A>
	? ServerListenerEvent<A>
	: T extends ServerToClientEventDeclaration<infer A>
	? ServerSenderEvent<A>
	: T extends BidirectionalEventDeclaration<infer S, infer C>
	? ServerEvent<S, C>
	: T extends LegacyEventDeclaration<infer SA, infer CA>
	? ServerEvent<SA, CA>
	: T extends LegacyAsyncFunctionDeclaration<infer SA, infer SR, infer CA, infer CR>
	? ServerAsyncFunction<SA, CA, SR, CR>
	: T extends FunctionDeclaration<infer SA, infer SR>
	? ServerFunction<SA, SR>
	: T extends ExperienceBroadcastEventDeclaration<infer A>
	? ExperienceBroadcastEvent<A>
	: T extends ExperienceReplicatingEventDeclaration<infer A>
	? ServerMessagingEvent<A>
	: never;

/////////////////////////////////////////
// * Results
/////////////////////////////////////////

export type ClientBuildResult<T extends RemoteDeclarations> = { [P in keyof T]: InferClientRemote<T[P]> };
export type ServerBuildResult<T extends RemoteDeclarations> = { [P in keyof T]: InferServerRemote<T[P]> };

export const DeclarationTypeCheck = oneOf<DeclarationLike["Type"] | DeclarationNamespaceLike["Type"]>(
	"Event",
	"Function",
	"AsyncFunction",
	"Namespace",
	"Messaging",
	"ExperienceEvent",
);
