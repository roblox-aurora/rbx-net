/* eslint-disable @typescript-eslint/no-explicit-any */
import { MiddlewareOverload, NetGlobalMiddleware } from "../middleware";
import {
	FunctionDeclaration,
	RemoteDeclarations,
	DefinitionsCreateResult,
	NamespaceDeclaration,
	ServerToClientEventDeclaration,
	ClientToServerEventDeclaration,
	BidirectionalEventDeclaration,
	AsyncServerFunctionDeclaration,
	AsyncClientFunctionDeclaration,
	DeclarationTypeCheck,
} from "./Types";
import { ServerDefinitionBuilder } from "./ServerDefinitionBuilder";
import { ClientDefinitionBuilder } from "./ClientDefinitionBuilder";
import { NamespaceBuilder, NamespaceConfiguration } from "./NamespaceBuilder";

export interface DefinitionConfiguration {
	/**
	 * Middleware that's applied to _all_ remotes on the server
	 *
	 * @default undefined
	 */
	readonly ServerGlobalMiddleware?: NetGlobalMiddleware[];

	/**
	 * Whether or not the server remotes are automatically generated
	 *
	 * This will default to `true` if the top-level definition, or the value of the parent namespace.
	 *
	 * @default true
	 */
	readonly ServerAutoGenerateRemotes?: boolean;

	/**
	 * Whether or not `Client.Get(...)` should yield for the remote to exist
	 *
	 * If `true` - Will yield until the remote exists, or error after 60 seconds.
	 *
	 * If `false` - Will error if the remote does not exist.
	 *
	 * @default true
	 */
	readonly ClientGetShouldYield?: boolean;
}

namespace NetDefinitions {
	/**
	 * Validates the specified declarations to ensure they're valid before usage
	 * @param declarations The declarations
	 */
	function validateDeclarations(declarations: RemoteDeclarations) {
		for (const [, declaration] of pairs(declarations)) {
			assert(DeclarationTypeCheck.check(declaration.Type), DeclarationTypeCheck.errorMessage);
		}
	}

	/**
	 * Creates definitions for Remote instances that can be used on both the client and server.
	 * @description https://docs.vorlias.com/rbx-net/docs/3.0/definitions#definitions-oh-my
	 * @param declarations
	 */
	export function Create<T extends RemoteDeclarations>(declarations: T, configuration: DefinitionConfiguration) {
		validateDeclarations(declarations);
		return identity<DefinitionsCreateResult<T>>({
			Server: new ServerDefinitionBuilder<T>(declarations, configuration),
			Client: new ClientDefinitionBuilder<T>(declarations, configuration),
		});
	}

	/**
	 * Defines a namespace of remote definitions, which can be retrieved via `GetNamespace(namespaceId)`
	 *
	 * E.g.
	 * ```ts
	 * const Remotes = Net.Definitions.Create({
	 * 		ExampleGroup: Net.Definitions.Namespace({
	 * 			ExampleGroupRemote: Net.Definitions.ServerToClientEvent<[message: string]>(),
	 * 		}),
	 * });
	 * const ExampleGroupRemote = Remotes.Server.GetNamespace("ExampleGroup").Create("ExampleGroupRemote");
	 * ```
	 *
	 * This is useful for categorizing remotes by feature.
	 */
	export function Namespace<T extends RemoteDeclarations>(declarations: T, configuration?: NamespaceConfiguration) {
		return {
			Type: "Namespace",
			Definitions: new NamespaceBuilder(declarations, configuration),
		} as NamespaceDeclaration<T>;
	}

	/**
	 * Defines a function in which strictly the client can call the server asynchronously
	 *
	 * `Client` [`Calls`] -> `Server` [`Recieves Call`]
	 * ... (asynchronously) ...
	 * `Server` [`Responds to Call`] -> `Client` [`Recieves Response`]
	 */
	export function ServerAsyncFunction<
		ServerFunction extends (...args: any[]) => defined = (...args: unknown[]) => defined
	>(mw?: MiddlewareOverload<Parameters<ServerFunction>>) {
		return {
			Type: "AsyncFunction",
			ServerMiddleware: mw,
		} as AsyncServerFunctionDeclaration<Parameters<ServerFunction>, ReturnType<ServerFunction>>;
	}

	/**
	 * Defines a function in which strictly the server can call the client asynchronously
	 *
	 * `Server` [`Calls`] -> `Client` [`Recieves Call`]
	 * ... (asynchronously) ...
	 * `Client` [`Responds to Call`] -> `Server` [`Recieves Response`]
	 */
	export function ClientAsyncFunction<
		ClientFunction extends (...args: any[]) => defined = (...args: unknown[]) => defined
	>() {
		return {
			Type: "AsyncFunction",
		} as AsyncClientFunctionDeclaration<Parameters<ClientFunction>, ReturnType<ClientFunction>>;
	}

	/**
	 * Defines a regular function in which strictly the client can call the server synchronously
	 *
	 * (Synchronous) `Client` [`Calls`, `Recieves Response`] <- (yields for response) -> `Server` [`Recieves Call`, `Responds`]
	 */
	export function ServerFunction<ServerFunction extends (...args: any[]) => any>(
		mw?: MiddlewareOverload<Parameters<ServerFunction>>,
	) {
		return {
			Type: "Function",
			ServerMiddleware: mw,
		} as FunctionDeclaration<Parameters<ServerFunction>, ReturnType<ServerFunction>>;
	}

	/**
	 * Defines an event in which strictly the server fires an event that is recieved by clients
	 *
	 * `Server` [`Sends`] => `Client(s)` [`Recieves`]
	 *
	 * On the client, this will give an event that can use `Connect`.
	 *
	 * On the server, this will give an event that can use `SendToPlayer`, `SendToAllPlayers`, `SendToAllPlayersExcept`
	 *
	 */
	export function ServerToClientEvent<ServerArgs extends readonly unknown[] = unknown[]>() {
		return {
			ServerMiddleware: [],
			Type: "Event",
		} as ServerToClientEventDeclaration<ServerArgs>;
	}

	/**
	 * Defines an event in which strictly clients fire an event that's recieved by the server
	 *
	 * `Client(s)` [`Sends`] => `Server` [`Recieves`]
	 *
	 * On the client, this will give an event that can use `SendToServer`.
	 *
	 * On the server, this will give an event that can use `Connect`.
	 *
	 * @param mw The middleware of this event.
	 */
	export function ClientToServerEvent<
		ClientArgs extends readonly unknown[] = unknown[]
	>(): ClientToServerEventDeclaration<ClientArgs>;
	export function ClientToServerEvent<ClientArgs extends readonly unknown[]>(
		mw?: MiddlewareOverload<ClientArgs>,
	): ClientToServerEventDeclaration<ClientArgs>;
	export function ClientToServerEvent<ClientArgs extends readonly unknown[] = unknown[]>(
		mw?: MiddlewareOverload<ClientArgs>,
	) {
		return {
			Type: "Event",
			ServerMiddleware: mw,
		} as ClientToServerEventDeclaration<ClientArgs>;
	}

	/**
	 * Defines a remote event that can be fired both from the client and server
	 *
	 * This should only be required in rare use cases where `ClientToServerEvent` or `ServerToClientEvent` is not sufficient.
	 */
	export function BidirectionalEvent<
		ServerConnect extends readonly unknown[] = unknown[],
		ClientConnect extends readonly unknown[] = unknown[]
	>(): BidirectionalEventDeclaration<ServerConnect, ClientConnect>;
	export function BidirectionalEvent<
		ServerConnect extends readonly unknown[] = unknown[],
		ClientConnect extends readonly unknown[] = unknown[]
	>(mw?: MiddlewareOverload<ServerConnect>): BidirectionalEventDeclaration<ServerConnect, ClientConnect>;
	export function BidirectionalEvent<
		ServerArgs extends readonly unknown[] = unknown[],
		ClientArgs extends readonly unknown[] = unknown[]
	>() {
		return {
			Type: "Event",
			ServerMiddleware: [],
		} as BidirectionalEventDeclaration<ServerArgs, ClientArgs>;
	}
}

export default NetDefinitions;
