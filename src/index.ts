import NetDefinitions, { NetworkModelConfiguration } from "./definitions";
import { NetMiddleware, ServerCallbackMiddleware } from "./middleware";
import { $env, $NODE_ENV } from "rbxts-transform-env";
import {
	ClientBuildResult,
	RemoteContexts,
	FilterClientDeclarations,
	FilterGroups,
	FilterServerDeclarations,
	NamespaceDeclaration,
	RemoteDeclarations,
	ServerBuildResult,
	Constructor,
} from "./definitions/Types";
import { $package } from "rbxts-transform-debug";
import { EventBuilder, Unsafe } from "./definitions/Classes/RemoteBuilders/EventBuilder";
import { CheckLike, ToCheck } from "./middleware/TypeCheckMiddleware/types";
import { ExperienceBroadcastEventBuilder } from "./definitions/Classes/MessagingBuilders/MessageBuilder";
import { SerializedClassTypeBuilder } from "./definitions/Classes/Serialization/SerializedClassTypeBuilder";
import { Serializer } from "./definitions/Classes/RemoteBuilders/DefinitionBuilder";
import { SerializedTypeBuilder } from "./definitions/Classes/Serialization/SerializedTypeBuilder";
import { NetValidation } from "./types";

/**
 * Networking Library for Roblox
 * @version 4.0
 */
namespace Net {
	/**
	 * The definitions API for Net
	 */
	export const Definitions = NetDefinitions;

	export const Types = NetValidation;

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
			K extends keyof FilterGroups<T>,
		> = T[K] extends NamespaceDeclaration<infer A> ? A : never;

		/**
		 * Gets the definitions type for the given definition
		 *
		 * e.g.
		 * ```ts
		 * type RemoteDefinitions = Net.Util.GetDeclarationDefinitions<typeof Remotes>;
		 * ```
		 */
		export type GetDeclarationDefinitions<T extends RemoteContexts<RemoteDeclarations>> = T extends RemoteContexts<
			infer U
		>
			? U
			: never;

		/**
		 * Gets the keys for each remote item in a definition
		 *
		 * ```ts
		 * type RemoteIds = Net.Util.GetRemoteKeys<typeof Remotes>;
		 * ```
		 */
		export type GetClientRemoteKeys<T extends RemoteContexts<any>> = T extends RemoteContexts<infer A>
			? keyof FilterClientDeclarations<A>
			: never;

		/**
		 * Gets the keys for each remote item in a definition
		 *
		 * ```ts
		 * type RemoteIds = Net.Util.GetRemoteKeys<typeof Remotes>;
		 * ```
		 */
		export type GetServerRemoteKeys<T extends RemoteContexts<any>> = T extends RemoteContexts<infer A>
			? keyof FilterServerDeclarations<A>
			: never;

		/**
		 * Gets the keys for each definition namespace in a definition
		 *
		 * ```ts
		 * type NamespaceIds = Net.Util.GetNamespaceKeys<typeof Remotes>;
		 * ```
		 */
		export type GetNamespaceKeys<T extends RemoteContexts<any>> = T extends RemoteContexts<infer A>
			? keyof FilterGroups<A>
			: never;
	}

	export const DIST = $env.string("TYPE", "TS");
	/**
	 * The version of RbxNet
	 */
	export const VERSION = `ZENERITH_INTERNAL ${$package.version}`;

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
	 * @deprecated
	 */
	export const CreateDefinitions = Definitions.Create;

	export const BuildDefinition = Definitions.Create;

	/**
	 * Define a remote object
	 * @param typeChecks The type arguments for the remote object
	 * @returns The builder for a remote
	 */
	export function Remote<T extends ReadonlyArray<unknown>>(): Unsafe<EventBuilder<[]>>;
	export function Remote<T extends ReadonlyArray<unknown>>(...typeChecks: ToCheck<T>): EventBuilder<T>;
	export function Remote<T extends ReadonlyArray<unknown>>(...typeChecks: ToCheck<T>): EventBuilder<T> {
		if (typeChecks.size() === 0) {
			return new EventBuilder();
		}

		return new EventBuilder().WithArgumentTypes(...(typeChecks as never));
	}

	/**
	 * @internal WIP
	 */
	export function SerializerForClassType<TClass extends Constructor>(value: TClass) {
		return new SerializedClassTypeBuilder(value);
	}

	/**
	 * @internal WIP
	 */
	export function Serializer<TIn extends object, TOut>(value: Serializer<TIn, TOut>) {
		return new SerializedTypeBuilder(value);
	}

	/**
	 * Defines a server-only network object that broadcasts a message between servers
	 *
	 * - Internally uses {@link MessagingService} to communicate between servers
	 * - Will use only one messaging topic, however it's still recommended to use this sparingly!
	 * @returns The builder for the experience broadcaster
	 */
	export function Broadcaster<T>(check: CheckLike<T>): ExperienceBroadcastEventBuilder<T> {
		return new ExperienceBroadcastEventBuilder<T>().WithMessageType(check);
	}
}

export = Net;
