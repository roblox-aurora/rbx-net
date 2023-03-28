import * as NetServerContext from "./server";
import * as NetClientContext from "./client";
import NetDefinitions, { DefinitionConfiguration } from "./definitions";
import { NetMiddleware } from "./middleware";
import { $env, $ifEnv, $NODE_ENV } from "rbxts-transform-env";
import { $print } from "rbxts-transform-debug";
import {
	ClientBuildResult,
	DefinitionsCreateResult,
	FilterClientDeclarations,
	FilterGroups,
	FilterServerDeclarations,
	NamespaceDeclaration,
	RemoteDeclarations,
	ServerBuildResult,
} from "./definitions/Types";

/**
 * Networking Library for Roblox
 * @version 3.1
 */
namespace Net {
	/**
	 * Legacy client API for Net
	 * @deprecated
	 */
	export const Client = NetClientContext;

	/**
	 * Legacy server API for Net
	 * @deprecated
	 */
	export const Server = NetServerContext;

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
			T extends DefinitionsCreateResult<RemoteDeclarations>
		> = T extends DefinitionsCreateResult<infer U> ? U : never;

		/**
		 * Gets the keys for each remote item in a definition
		 *
		 * ```ts
		 * type RemoteIds = Net.Util.GetRemoteKeys<typeof Remotes>;
		 * ```
		 */
		export type GetClientRemoteKeys<T extends DefinitionsCreateResult<any>> = T extends DefinitionsCreateResult<
			infer A
		>
			? keyof FilterClientDeclarations<A>
			: never;

		/**
		 * Gets the keys for each remote item in a definition
		 *
		 * ```ts
		 * type RemoteIds = Net.Util.GetRemoteKeys<typeof Remotes>;
		 * ```
		 */
		export type GetServerRemoteKeys<T extends DefinitionsCreateResult<any>> = T extends DefinitionsCreateResult<
			infer A
		>
			? keyof FilterServerDeclarations<A>
			: never;

		/**
		 * Gets the keys for each definition namespace in a definition
		 *
		 * ```ts
		 * type NamespaceIds = Net.Util.GetNamespaceKeys<typeof Remotes>;
		 * ```
		 */
		export type GetNamespaceKeys<T extends DefinitionsCreateResult<any>> = T extends DefinitionsCreateResult<
			infer A
		>
			? keyof FilterGroups<A>
			: never;
	}

	export const DIST = $env<string>("TYPE", "TS");
	/**
	 * The version of RbxNet
	 */
	export const VERSION = $NODE_ENV === "production" ? PKG_VERSION : `DEV ${DIST})} ${PKG_VERSION}`;

	/**
	 * Built-in middlewares
	 */
	export const Middleware = NetMiddleware;
	/**
	 * Middleware function type for Net
	 */
	export type Middleware = NetMiddleware;

	/**
	 * Short-hand for `Net.Definitions.Create`
	 * @see {@link Definitions.Create}
	 */
	export function CreateDefinitions<T extends RemoteDeclarations>(
		declarations: T,
		configuration?: DefinitionConfiguration,
	) {
		return Definitions.Create(declarations, configuration);
	}
}

$ifEnv("NODE_ENV", "development", () => {
	$print(`Net ${Net.DIST} ${Net.VERSION}`);
});

export = Net;
