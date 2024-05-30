/* eslint-disable @typescript-eslint/no-explicit-any */
import { MiddlewareOverload, NetGlobalMiddleware } from "../middleware";
import {
	FunctionDeclaration,
	RemoteDeclarations,
	RemoteContexts,
	ServerToClientEventDeclaration,
	ClientToServerEventDeclaration,
	BidirectionalEventDeclaration,
	AsyncServerFunctionDeclaration,
	AsyncClientFunctionDeclaration,
	ExperienceBroadcastEventDeclaration,
	ExperienceReplicatingEventDeclaration,
} from "./Types";
import { NamespaceConfiguration } from "./Classes/NamespaceGenerator";
import { AsyncFunctionBuilder } from "./Classes/RemoteBuilders/AsyncFunctionBuilder";
import { EventBuilder } from "./Classes/RemoteBuilders/EventBuilder";
import { DefinitionBuilder } from "./Classes/RemoteBuilders/DefinitionBuilder";

export interface NetworkModelConfiguration {
	/**
	 * Middleware that's applied to _all_ remotes on the server
	 *
	 * @default undefined
	 */
	readonly ServerGlobalMiddleware?: Array<NetGlobalMiddleware>;

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

	/**
	 * Add a microprofiler debug label to each callback
	 */
	readonly MicroprofileCallbacks?: boolean;
}

namespace NetDefinitions {
	/**
	 * Creates definitions for Remote instances that can be used on both the client and server.
	 * @description https://docs.vorlias.com/rbx-net/docs/3.0/definitions#definitions-oh-my
	 * @param declarations
	 * @deprecated Use `Create().Add(declarations)`
	 */
	export function Create<T extends RemoteDeclarations>(
		declarations: T,
		configuration?: NetworkModelConfiguration,
	): RemoteContexts<T>;
	/**
	 * Creates definitions using the new net definitions builder
	 *
	 * @version 4.0
	 */
	export function Create(): DefinitionBuilder;
	export function Create(
		declarations?: RemoteDeclarations,
		configuration?: NetworkModelConfiguration,
	): RemoteContexts<RemoteDeclarations> | DefinitionBuilder {
		if (declarations !== undefined) {
			configuration ??= {};
			return new DefinitionBuilder().AddLegacyDefinitions(declarations).SetConfiguration(configuration).Build();
		} else {
			return new DefinitionBuilder();
		}
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
	 *
	 * @deprecated Use {@link Create}()
	 */
	export function Namespace<T extends RemoteDeclarations>(declarations: T, configuration?: NamespaceConfiguration) {
		return new DefinitionBuilder()
			.AddLegacyDefinitions(declarations)
			.SetConfiguration(configuration ?? {})
			.ToNamespace();
	}

	/**
	 * Defines a function in which strictly the client can call the server asynchronously
	 *
	 * `Client` [`Calls`] -> `Server` [`Recieves Call`]
	 * ... (asynchronously) ...
	 * `Server` [`Responds to Call`] -> `Client` [`Recieves Response`]
	 *
	 * @deprecated
	 */
	export function ServerAsyncFunction<
		ServerFunction extends (...args: Array<any>) => unknown = (...args: Array<unknown>) => unknown,
	>(mw?: MiddlewareOverload<Parameters<ServerFunction>>) {
		const funBuilder = new AsyncFunctionBuilder();
		if (mw) {
			funBuilder.WithServerCallbackMiddleware(...mw);
		}

		return funBuilder.OnServer() as AsyncServerFunctionDeclaration<
			Parameters<ServerFunction>,
			ReturnType<ServerFunction>
		>;
	}

	/**
	 * **_Note_: This uses {@link MessagingService}, and thus is subject to those quotas/limits.**
	 *
	 * **_Note_: Unlike other definitions in Net, this is only available on the server.**
	 *
	 * Defines an event in which allows broadcasting messages between servers in the experience.
	 *
	 * `Source Server` [`Broadcasts`] -> `Other Servers` [`Recieves Broadcast`]
	 *
	 * or at a target {@link DataModel.JobId JobId}
	 *
	 * `Source Server [`Broadcasts`] -> `Target Server` [`Recieves Broadcast`]
	 *
	 * @version 3.0
	 */
	export function ExperienceBroadcastEvent<ServerArgs extends defined = defined>() {
		return {
			Type: "Messaging",
		} as ExperienceBroadcastEventDeclaration<ServerArgs>;
	}

	/**
	 * @version 3.0
	 *
	 * **_Note_: This uses {@link MessagingService}, and thus is subject to those quotas/limits.**
	 *
	 * Defines an event that allows a server to broadcast to all or specified _clients_ in the experience.
	 *
	 * `Source Server` [`Broadcasts`] -> `Other Servers` [`Recieves Broadcast`] -> `Client` [`Recieves Forwarded Broadcast`]
	 *
	 * @hidden Experimental API
	 * @deprecated Not yet official API, could be changed or removed.
	 * @internal
	 */
	export function EXPERIMENTAL_ExperienceReplicatedEvent<
		ServerArgs extends ReadonlyArray<unknown> = Array<unknown>,
	>() {
		return {
			Type: "ExperienceEvent",
		} as ExperienceReplicatingEventDeclaration<ServerArgs>;
	}

	/**
	 * Defines a function in which strictly the server can call the client asynchronously
	 *
	 * `Server` [`Calls`] -> `Client` [`Recieves Call`]
	 * ... (asynchronously) ...
	 * `Client` [`Responds to Call`] -> `Server` [`Recieves Response`]
	 *
	 * @deprecated
	 */
	export function ClientAsyncFunction<
		ClientFunction extends (...args: Array<any>) => defined = (...args: Array<unknown>) => defined,
	>() {
		const funBuilder = new AsyncFunctionBuilder();
		return funBuilder.OnClient() as AsyncClientFunctionDeclaration<
			Parameters<ClientFunction>,
			ReturnType<ClientFunction>
		>;
	}

	/**
	 * Defines a regular function in which strictly the client can call the server synchronously
	 *
	 * (Synchronous) `Client` [`Calls`, `Recieves Response`] <- (yields for response) -> `Server` [`Recieves Call`, `Responds`]
	 *
	 * @deprecated
	 */
	export function ServerFunction<ServerFunction extends (...args: Array<any>) => any>(
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
	 * @deprecated
	 */
	export function ServerToClientEvent<ServerArgs extends ReadonlyArray<unknown> = Array<unknown>>() {
		const builder = new EventBuilder<ServerArgs>();
		return builder.OnServer() as ServerToClientEventDeclaration<ServerArgs>;
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
	 *
	 * @deprecated
	 */
	export function ClientToServerEvent<
		ClientArgs extends ReadonlyArray<unknown> = Array<unknown>,
	>(): ClientToServerEventDeclaration<ClientArgs>;
	export function ClientToServerEvent<ClientArgs extends ReadonlyArray<unknown>>(
		mw?: MiddlewareOverload<ClientArgs>,
	): ClientToServerEventDeclaration<ClientArgs>;
	export function ClientToServerEvent<ClientArgs extends ReadonlyArray<unknown> = Array<unknown>>(
		mw?: MiddlewareOverload<ClientArgs>,
	) {
		const builder = new EventBuilder<ClientArgs>();
		if (mw !== undefined) {
			builder.WithServerCallbackMiddleware(...(mw as Array<never>));
		}

		return builder.OnClient() as ClientToServerEventDeclaration<ClientArgs>;
	}

	/**
	 * Defines a remote event that can be fired both from the client and server
	 *
	 * This should only be required in rare use cases where `ClientToServerEvent` or `ServerToClientEvent` is not sufficient.
	 *
	 * Check to see if {@link ServerAsyncFunction} is more sufficient for your use case.
	 * @deprecated
	 */
	export function BidirectionalEvent<
		ServerConnect extends ReadonlyArray<unknown> = Array<unknown>,
		ClientConnect extends ReadonlyArray<unknown> = Array<unknown>,
	>(): BidirectionalEventDeclaration<ServerConnect, ClientConnect>;
	export function BidirectionalEvent<
		ServerArgs extends ReadonlyArray<unknown> = Array<unknown>,
		ClientArgs extends ReadonlyArray<unknown> = Array<unknown>,
	>() {
		return {
			Type: "Event",
			Unreliable: false,
		} as BidirectionalEventDeclaration<ServerArgs, ClientArgs>;
	}
}

export default NetDefinitions;
