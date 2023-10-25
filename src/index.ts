import NetDefinitions, { DefinitionConfiguration } from "./definitions";
import { NetMiddleware, ServerCallbackMiddleware } from "./middleware";
import { $env, $NODE_ENV } from "rbxts-transform-env";
import {
	ClientBuildResult,
	GeneratedDefinitions,
	FilterClientDeclarations,
	FilterGroups,
	FilterServerDeclarations,
	NamespaceDeclaration,
	RemoteDeclarations,
	ServerBuildResult,
} from "./definitions/Types";
import { $package } from "rbxts-transform-debug";

/**
 * Networking Library for Roblox
 * @version 4.0
 */
namespace Net {
	/**
	 * The definitions API for Net
	 */
	export const Definitions = NetDefinitions;

	/**
	 * Utility types for Net
	 */
	export namespace Util {
		/**
		 * Returns a `key -> value` type map of remotes in the specified declaration, mapped to server objects.
		 *
		 * ```ts
		 * type GlobalNamespace = Net.Util.GetDeclarationDefinitions<typeof Remotes>;
		 * type ServerGlobalRemotes = Net.Util.GetServerRemotes<GlobalNamespace>;
		 * ```
		 */
		export type GetServerRemotes<T extends RemoteDeclarations> = ServerBuildResult<FilterServerDeclarations<T>>;

		/**
		 * Returns a `key -> value` type map of remotes in the specified declaration, mapped to client objects.
		 *
		 * ```ts
		 * type GlobalNamespace = Net.Util.GetDeclarationDefinitions<typeof Remotes>;
		 * type ClientGlobalRemotes = Net.Util.GetClientRemotes<GlobalNamespace>;
		 * ```
		 */
		export type GetClientRemotes<T extends RemoteDeclarations> = ClientBuildResult<FilterClientDeclarations<T>>;

		/**
		 * Returns the sub declaration of a declaration based on the given namespace
		 *
		 * ```ts
		 * type GlobalNamespace = Net.Util.GetDeclarationDefinitions<typeof Remotes>;
		 * type ExampleNamespace = Net.Util.GetNamespaceDefinitions<GlobalNamespace, "Example">;
		 * ```
		 */
		export type GetNamespaceDefinitions<
			T extends RemoteDeclarations,
			K extends keyof FilterGroups<T>
		> = T[K] extends NamespaceDeclaration<infer A> ? A : never;

		/**
		 * Gets the definitions type for the given definition
		 *
		 * e.g.
		 * ```ts
		 * type RemoteDefinitions = Net.Util.GetDeclarationDefinitions<typeof Remotes>;
		 * ```
		 */
		export type GetDeclarationDefinitions<
			T extends GeneratedDefinitions<RemoteDeclarations>
		> = T extends GeneratedDefinitions<infer U> ? U : never;

		/**
		 * Gets the keys for each remote item in a definition
		 *
		 * ```ts
		 * type RemoteIds = Net.Util.GetRemoteKeys<typeof Remotes>;
		 * ```
		 */
		export type GetClientRemoteKeys<T extends GeneratedDefinitions<any>> = T extends GeneratedDefinitions<infer A>
			? keyof FilterClientDeclarations<A>
			: never;

		/**
		 * Gets the keys for each remote item in a definition
		 *
		 * ```ts
		 * type RemoteIds = Net.Util.GetRemoteKeys<typeof Remotes>;
		 * ```
		 */
		export type GetServerRemoteKeys<T extends GeneratedDefinitions<any>> = T extends GeneratedDefinitions<infer A>
			? keyof FilterServerDeclarations<A>
			: never;

		/**
		 * Gets the keys for each definition namespace in a definition
		 *
		 * ```ts
		 * type NamespaceIds = Net.Util.GetNamespaceKeys<typeof Remotes>;
		 * ```
		 */
		export type GetNamespaceKeys<T extends GeneratedDefinitions<any>> = T extends GeneratedDefinitions<infer A>
			? keyof FilterGroups<A>
			: never;
	}

	export const DIST = $env.string("TYPE", "TS");
	/**
	 * The version of RbxNet
	 */
	export const VERSION = $NODE_ENV === "production" ? $package.version : `DEV ${DIST})} ${$package.version}`;

	/**
	 * Built-in middlewares
	 */
	export const Middleware = NetMiddleware;
	/**
	 * Middleware function type for Net
	 * @deprecated
	 */
	export type Middleware = ServerCallbackMiddleware;

	/**
	 * Short-hand for `Net.Definitions.Create`
	 * @see {@link Definitions.Create}
	 */
	export const CreateDefinitions = Definitions.Create;
}

export = Net;
