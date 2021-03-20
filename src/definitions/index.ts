/* eslint-disable @typescript-eslint/no-explicit-any */
import { MiddlewareOverload, NetGlobalMiddleware } from "../middleware";
import {
	LegacyAsyncFunctionDeclaration,
	AsyncFunctionDeclarationLike,
	FunctionDeclaration,
	FunctionDeclarationLike,
	LegacyEventDeclaration,
	RemoteDeclarations,
	DefinitionsCreateResult,
	GroupDeclaration,
	ServerToClientEventDeclaration,
	ClientToServerEventDeclaration,
	BidirectionalEventDeclaration,
	AsyncServerFunctionDeclaration,
	AsyncClientFunctionDeclaration,
} from "./Types";
import { oneOf } from "../internal/validator";
import { ServerDefinitionBuilder } from "./ServerDefinitionBuilder";
import { ClientDefinitionBuilder } from "./ClientDefinitionBuilder";
import { warnOnce } from "../internal";
import { $nameof } from "rbxts-transform-debug";

const declarationType = oneOf("Event", "Function", "AsyncFunction", "Group");

namespace NetDefinitions {
	/**
	 * Validates the specified declarations to ensure they're valid before usage
	 * @param declarations The declarations
	 */
	function validateDeclarations(declarations: RemoteDeclarations) {
		for (const [, declaration] of pairs(declarations)) {
			assert(declarationType.check(declaration.Type), declarationType.errorMessage);
		}
	}

	/**
	 * Creates definitions for Remote instances that can be used on both the client and server.
	 * @description https://docs.vorlias.com/rbx-net/docs/2.0/definitions#definitions-oh-my
	 * @param declarations
	 */
	export function Create<T extends RemoteDeclarations>(declarations: T, globalMiddleware?: NetGlobalMiddleware[]) {
		validateDeclarations(declarations);
		return identity<DefinitionsCreateResult<T>>({
			Server: new ServerDefinitionBuilder<T>(declarations, globalMiddleware),
			Client: new ClientDefinitionBuilder<T>(declarations),
		});
	}

	/**
	 * Like `Create` but used to group remotes, which can be retrieved with the corresponding `Group(key)` method.
	 * @internal
	 */
	// TODO
	export function Group<T extends RemoteDeclarations>(declarations: T) {
		return {
			Type: "Group",
			Definitions: declarations,
		} as GroupDeclaration<T>;
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

	export interface ReadonlyGlobalMiddleware {}
	export interface ReadonlyGlobalMiddlewareArgs {
		(remoteName: string, remoteData: readonly unknown[], callingPlayer?: Player): void;
	}

	/**
	 * Creates a global readonly middleware
	 */
	export function GlobalReadonlyMiddleware(middleware: ReadonlyGlobalMiddlewareArgs) {
		const ret: NetGlobalMiddleware = (next, event) => (sender, ...args) => {
			middleware(event.GetInstance().Name, args, sender);
			return next(sender, ...args);
		};
		return ret;
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

	/// REGION deprecated members

	/**
	 * Creates a definition for a function
	 * @deprecated
	 */
	export function Function<ServerFunction extends (...args: any[]) => any>(
		mw?: MiddlewareOverload<Parameters<ServerFunction>>,
	): FunctionDeclaration<Parameters<ServerFunction>, ReturnType<ServerFunction>>;
	export function Function<ServerArgs extends ReadonlyArray<unknown>, ServerReturns extends unknown = undefined>(
		mw?: MiddlewareOverload<ServerArgs>,
	): FunctionDeclaration<ServerArgs, ServerReturns>;
	export function Function(mw?: MiddlewareOverload<any>): FunctionDeclarationLike {
		warnOnce(
			`[rbx-net] Definition '${$nameof(Function)}' is deprecated, use '${$nameof(
				ServerAsyncFunction,
			)}' or '${$nameof(
				ClientAsyncFunction,
			)}' in your declarations - https://github.com/roblox-aurora/rbx-net/issues/35`,
		);
		return {
			Type: "Function",
			ServerMiddleware: mw,
		} as FunctionDeclarationLike;
	}

	/**
	 * Creates a definition for an event
	 *
	 *
	 * ### If the event is fired by the client to the server, use `ClientToServerEvent`.
	 * ### If the event is fired by the server to the client, use `ServerToClientEvent`.
	 * ### If the event is both fired by client and server, use `BidirectionalEvent`.
	 *
	 * @deprecated This will be removed in future - please redesign your definitions
	 *
	 */
	export function Event<ServerArgs extends unknown[] = unknown[], ClientArgs extends unknown[] = unknown[]>(
		mw?: MiddlewareOverload<any>,
	): LegacyEventDeclaration<ServerArgs, ClientArgs>;
	export function Event<ServerArgs extends unknown[] = unknown[], ClientArgs extends unknown[] = unknown[]>(
		mw?: MiddlewareOverload<any>,
	) {
		warnOnce(
			`[rbx-net] Definition '${$nameof(Event)}' is deprecated, use '${$nameof(ServerToClientEvent)}', '${$nameof(
				ClientToServerEvent,
			)}' or '${$nameof(
				BidirectionalEvent,
			)}' in your declarations - https://github.com/roblox-aurora/rbx-net/issues/35`,
		);
		return {
			Type: "Event",
			ServerMiddleware: mw,
		} as LegacyEventDeclaration<ServerArgs, ClientArgs>;
	}

	/**
	 * Creates a definition for an async function
	 *
	 * ### If the function callback is on the server, use `AsyncServerFunction`.
	 * ### If the function callback is on the client, use `AsyncClientFunction`.
	 *
	 * @deprecated This will be removed in future - please redesign your definitions
	 */
	export function AsyncFunction<
		ServerFunction extends (...args: any[]) => defined = (...args: unknown[]) => defined,
		ClientFunction extends (...args: any[]) => defined = (...args: unknown[]) => defined
	>(
		mw?: MiddlewareOverload<Parameters<ServerFunction>>,
	): LegacyAsyncFunctionDeclaration<
		Parameters<ServerFunction>,
		ReturnType<ServerFunction>,
		Parameters<ClientFunction>,
		ReturnType<ClientFunction>
	>;
	export function AsyncFunction(mw?: MiddlewareOverload<any>): AsyncFunctionDeclarationLike {
		warnOnce(
			`[rbx-net] Definition '${$nameof(AsyncFunction)}' is deprecated, use '${$nameof(
				ServerAsyncFunction,
			)}' or '${$nameof(
				ClientAsyncFunction,
			)}' in your declarations - https://github.com/roblox-aurora/rbx-net/issues/35`,
		);
		return {
			Type: "AsyncFunction",
			ServerMiddleware: mw,
		} as AsyncFunctionDeclarationLike;
	}
}

export default NetDefinitions;
