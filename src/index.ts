import * as NetServerContext from "./server";
import * as NetClientContext from "./client";
import NetDefinitions from "./definitions";
import { createTypeChecker, NetMiddleware } from "./middleware";
import { $env, $ifEnv, $NODE_ENV } from "rbxts-transform-env";
import { $dbg } from "rbxts-transform-debug";
import type { $DebugInfo } from "rbxts-transform-debug";
import NetSerialization from "./serialization";
import { ServerDefinitionBuilder } from "./definitions/ServerDefinitionBuilder";
import { ClientDefinitionBuilder } from "./definitions/ClientDefinitionBuilder";
import {
	ClientBuildResult,
	DefinitionsCreateResult,
	FilterDeclarations,
	FilterGroups,
	InferServerRemote,
	NamespaceDeclaration,
	RemoteDeclarations,
	ServerBuildResult,
} from "./definitions/Types";

/**
 * Networking Library for Roblox
 * @version 2.2
 */
namespace Net {
	/**
	 * An object that contains a `Serialize` method.
	 * @internal Still in development
	 */
	export type Serializable<T> = Serialization.Serializable<T>;

	/**
	 * A serialized representation of the object
	 * @internal Still in development
	 */
	export type Serialized<T> = Serialization.Serialized<T>;

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
		export type GetServerRemotes<T extends RemoteDeclarations> = ServerBuildResult<FilterDeclarations<T>>;

		/**
		 * Returns a `key -> value` type map of remotes in the specified declaration, mapped to client objects.
		 *
		 * ```ts
		 * type GlobalNamespace = Net.Util.GetDeclarationDefinitions<typeof Remotes>;
		 * type ClientGlobalRemotes = Net.Util.GetClientRemotes<GlobalNamespace>;
		 * ```
		 */
		export type GetClientRemotes<T extends RemoteDeclarations> = ClientBuildResult<FilterDeclarations<T>>;

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
		export type GetRemoteKeys<T extends DefinitionsCreateResult<any>> = T extends DefinitionsCreateResult<infer A>
			? keyof FilterDeclarations<A>
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
	 * Network serialization namespace
	 * @internal Still in development
	 */
	export const Serialization = NetSerialization;
}

$ifEnv("NODE_ENV", "development", () => {
	$dbg(Net.VERSION);

	const sanity = (value: unknown, debug: $DebugInfo) => {
		if (value === undefined) {
			throw `[${debug.file}:${debug.lineNumber}] ${debug.rawText} - FAIL`;
		} else {
			print(`[${debug.file}:${debug.lineNumber}] ${debug.rawText} - OK`);
		}
	};

	$dbg(Net.Definitions, sanity);

	$dbg(Net.Server, sanity);
	$dbg(Net.Server.Function, sanity);
	$dbg("new" in Net.Server.Function);
	$dbg(Net.Server.Event, sanity);
	$dbg(Net.Server.AsyncFunction, sanity);

	$dbg(Net.Client, sanity);
	$dbg(Net.Client.Function, sanity);
	$dbg(Net.Client.Event, sanity);
	$dbg(Net.Client.AsyncFunction, sanity);

	$dbg(createTypeChecker, sanity);
});

export = Net;
