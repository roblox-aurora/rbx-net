/* eslint-disable @typescript-eslint/no-explicit-any */
import { MiddlewareOverload } from "../middleware";
import {
	AsyncFunctionDeclaration,
	AsyncFunctionDeclarationLike,
	FunctionDeclaration,
	FunctionDeclarationLike,
	EventDeclaration,
	RemoteDeclarations,
	DefinitionsCreateResult,
	DeclarationGroup,
} from "./Types";
import { oneOf } from "../internal/validator";
import { ServerDefinitionBuilder } from "./ServerDefinitionBuilder";
import { ClientDefinitionBuilder } from "./ClientDefinitionBuilder";

const declarationType = oneOf("Event", "Function", "AsyncFunction");

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
	export function Create<T extends RemoteDeclarations>(declarations: T) {
		validateDeclarations(declarations);
		return identity<DefinitionsCreateResult<T>>({
			Server: new ServerDefinitionBuilder<T>(declarations),
			Client: new ClientDefinitionBuilder<T>(declarations),
		});
	}

	/**
	 * @internal
	 */
	export function Group<T extends RemoteDeclarations>(declarations: T) {
		return {
			Type: "Group",
			Definitions: declarations,
		} as DeclarationGroup<T>;
	}

	/**
	 * Creates a definition for an async function
	 */
	export function AsyncFunction<
		ServerFunction extends (...args: any[]) => defined = (...args: unknown[]) => defined,
		ClientFunction extends (...args: any[]) => defined = (...args: unknown[]) => defined
	>(
		mw?: MiddlewareOverload<Parameters<ServerFunction>>,
	): AsyncFunctionDeclaration<
		Parameters<ServerFunction>,
		ReturnType<ServerFunction>,
		Parameters<ClientFunction>,
		ReturnType<ClientFunction>
	>;
	export function AsyncFunction(mw?: MiddlewareOverload<any>): AsyncFunctionDeclarationLike {
		return {
			Type: "AsyncFunction",
			ServerMiddleware: mw,
		} as AsyncFunctionDeclarationLike;
	}

	/**
	 * Creates a definition for a function
	 */
	export function Function<ServerFunction extends (...args: any[]) => any>(
		mw?: MiddlewareOverload<Parameters<ServerFunction>>,
	): FunctionDeclaration<Parameters<ServerFunction>, ReturnType<ServerFunction>>;
	export function Function<ServerArgs extends ReadonlyArray<unknown>, ServerReturns extends unknown = undefined>(
		mw?: MiddlewareOverload<ServerArgs>,
	): FunctionDeclaration<ServerArgs, ServerReturns>;
	export function Function(mw?: MiddlewareOverload<any>): FunctionDeclarationLike {
		return {
			Type: "Function",
			ServerMiddleware: mw,
		} as FunctionDeclarationLike;
	}

	/**
	 * Creates a definition for an event
	 */
	export function Event<ServerArgs extends unknown[] = unknown[], ClientArgs extends unknown[] = unknown[]>(
		mw?: MiddlewareOverload<any>,
	): EventDeclaration<ServerArgs, ClientArgs> {
		return {
			Type: "Event",
			ServerMiddleware: mw,
		} as EventDeclaration<ServerArgs, ClientArgs>;
	}
}

export default NetDefinitions;
