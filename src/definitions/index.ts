/* eslint-disable @typescript-eslint/no-explicit-any */
import { MiddlewareOverload } from "helpers/EventConstructor";
import CreateNetDefinitionBuilder from "./CreateDefinitions";
import {
	AsyncFunctionDeclaration,
	AsyncFunctionDeclarationLike,
	FunctionDeclaration,
	FunctionDeclarationLike,
	EventDeclaration,
} from "./Types";

namespace NetDefinitions {
	export const Create = CreateNetDefinitionBuilder;

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
		} as const;
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
		} as const;
	}

	/**
	 * Creates a definition for an event
	 */
	export function Event<ServerArgs extends unknown[] = unknown[], ClientArgs extends unknown[] = unknown[]>(
		mw?: MiddlewareOverload<ServerArgs>,
	): EventDeclaration<ServerArgs, ClientArgs>;
	export function Event(mw?: MiddlewareOverload<any>) {
		return {
			Type: "Event",
			ServerMiddleware: mw,
		} as const;
	}
}

export default NetDefinitions;
