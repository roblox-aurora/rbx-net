/* eslint-disable @typescript-eslint/no-explicit-any */
import t from "@rbxts/t";
import { MiddlewareOverload } from "helpers/EventConstructor";
import { createTypeChecker, NetMiddleware } from "../middleware";
import CreateNetDefinitionBuilder, { AsyncFunctionDeclaration, Check } from "./CreateDefinitions";

type CheckMap<T> = { [P in keyof T]: Check<T[P]> };
namespace NetDefinitions {
	export const Create = CreateNetDefinitionBuilder;

	/**
	 * Creates a definition for an async function
	 */
	export function AsyncFunction<
		ServerArgs extends readonly unknown[] = unknown[],
		ClientArgs extends readonly unknown[] = unknown[]
	>(mw?: MiddlewareOverload<ServerArgs>) {
		return {
			Type: "AsyncFunction",
			ServerMiddleware: mw as [NetMiddleware<ServerArgs>],
			ClientArguments: (undefined as unknown) as CheckMap<ClientArgs>,
		} as const;
	}

	/**
	 * Creates a definition for a function
	 */
	export function Function<ServerArgs extends ReadonlyArray<unknown>>(mw?: MiddlewareOverload<ServerArgs>) {
		return {
			Type: "Function",
			ServerMiddleware: mw as [NetMiddleware<ServerArgs>],
		} as const;
	}

	/**
	 * Creates a definition for an event
	 */
	export function Event<ServerArgs extends unknown[], ClientArgs extends unknown[]>(
		mw?: MiddlewareOverload<ServerArgs>,
	) {
		return {
			Type: "Event",
			ServerMiddleware: mw as [NetMiddleware<ServerArgs>],
			ClientArguments: (undefined as unknown) as CheckMap<ClientArgs>,
		} as const;
	}
}

export default NetDefinitions;
