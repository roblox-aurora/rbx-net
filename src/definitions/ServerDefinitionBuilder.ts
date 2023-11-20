import { NetGlobalMiddleware } from "../middleware";
import { $dbg, $nameof, $print } from "rbxts-transform-debug";
import ServerAsyncFunction from "../server/ServerAsyncFunction";
import ServerEvent from "../server/ServerEvent";
import ServerFunction from "../server/ServerFunction";
import {
	AsyncServerFunctionDeclaration,
	BidirectionalEventDeclaration,
	ClientToServerEventDeclaration,
	DeclarationsOf,
	FilterGroups,
	NamespaceDeclaration,
	InferServerCallback,
	InferServerConnect,
	InferServerRemote,
	RemoteDeclarations,
	DeclarationLike,
	DeclarationNamespaceLike,
	FilterServerDeclarations,
} from "./Types";
import { NAMESPACE_ROOT, NAMESPACE_SEPARATOR, TagId } from "../internal";
import { InferDefinition } from "./NamespaceBuilder";
import { DefinitionConfiguration } from ".";
import ExperienceBroadcastEvent from "../messaging/ExperienceBroadcastEvent";
import ServerMessagingEvent from "../server/ServerMessagingEvent";
const CollectionService = game.GetService("CollectionService");
const RunService = game.GetService("RunService");

// Tidy up all the types here.
type ServerEventDeclarationKeys<T extends RemoteDeclarations> = keyof DeclarationsOf<
	FilterServerDeclarations<T>,
	ClientToServerEventDeclaration<any> | BidirectionalEventDeclaration<any, any>
> &
	string;

type ServerEventConnectFunction<T extends RemoteDeclarations, K extends keyof T> = InferServerConnect<
	Extract<T[K], ClientToServerEventDeclaration<any> | BidirectionalEventDeclaration<any, any>>
>;

type ServerFunctionDeclarationKeys<T extends RemoteDeclarations> = keyof DeclarationsOf<
	FilterServerDeclarations<T>,
	AsyncServerFunctionDeclaration<any, any>
> &
	string;

type ServerFunctionCallbackFunction<T extends RemoteDeclarations, K extends keyof T> = InferServerCallback<
	Extract<T[K], AsyncServerFunctionDeclaration<any, any>>
>;

type RemoteDeclarationDict<T extends RemoteDeclarations> =
	| Record<keyof FilterServerDeclarations<T> & string, DeclarationLike>
	| Record<keyof FilterGroups<T> & string, DeclarationNamespaceLike>;

// Keep the declarations fully isolated
const declarationMap = new WeakMap<ServerDefinitionBuilder<RemoteDeclarations>, RemoteDeclarations>();
const remoteEventCache = new Map<string, ServerEvent>();
const remoteAsyncFunctionCache = new Map<string, ServerAsyncFunction>();
const remoteFunctionCache = new Map<string, ServerFunction>();
const messagingEventCache = new Map<string, ExperienceBroadcastEvent>();
const messagingServerEventCache = new Map<string, ServerMessagingEvent>();

export interface ServerDefinitionConfig extends DefinitionConfiguration {}

export class ServerDefinitionBuilder<T extends RemoteDeclarations> {
	private globalMiddleware?: NetGlobalMiddleware[];

	public constructor(declarations: T, private config: ServerDefinitionConfig, private namespace = NAMESPACE_ROOT) {
		const {
			ServerAutoGenerateRemotes: AutoGenerateServerRemotes = true,
			ServerGlobalMiddleware: GlobalMiddleware,
		} = config;

		declarationMap.set(this, declarations);
		$dbg(declarations, (value, source) => {
			print(`[${source.file}:${source.lineNumber}]`, "== Server Declarations ==");
			for (const [name, va] of pairs(value)) {
				print(`[${source.file}:${source.lineNumber}]`, name, va.Type);
			}
		});

		// We only run remote creation on the server
		if (RunService.IsServer() && AutoGenerateServerRemotes) {
			this._InitServer();
		}

		this.globalMiddleware = GlobalMiddleware;
	}

	/** @internal Used internally by Net. Do not use. */
	private _CreateOrGetInstance(id: string, declaration: DeclarationLike) {
		assert(RunService.IsServer(), "Can only create server instances on the server");
		/**
		 * This is used to generate or fetch the specified remote from a declaration
		 *
		 * The generated remote id is based off the current namespace.
		 */

		const namespacedId = this.namespace !== NAMESPACE_ROOT ? [this.namespace, id].join(NAMESPACE_SEPARATOR) : id;
		const config = this.config;

		if (declaration.Type === "Function") {
			let func: ServerFunction;

			if (remoteFunctionCache.has(namespacedId)) {
				return remoteFunctionCache.get(namespacedId)!;
			} else {
				if (declaration.ServerMiddleware) {
					func = new ServerFunction(namespacedId, declaration.ServerMiddleware, config);
				} else {
					func = new ServerFunction(namespacedId, undefined, config);
				}
				CollectionService.AddTag(func.GetInstance(), TagId.DefinitionManaged);
				remoteFunctionCache.set(namespacedId, func);

				this.globalMiddleware?.forEach(mw => func._use(mw));
				return func;
			}
		} else if (declaration.Type === "AsyncFunction") {
			let asyncFunction: ServerAsyncFunction;

			// This should make certain use cases cheaper
			if (remoteAsyncFunctionCache.has(namespacedId)) {
				return remoteAsyncFunctionCache.get(namespacedId)!;
			} else {
				if (declaration.ServerMiddleware) {
					asyncFunction = new ServerAsyncFunction(namespacedId, declaration.ServerMiddleware, config);
				} else {
					asyncFunction = new ServerAsyncFunction(namespacedId, undefined, config);
				}
				CollectionService.AddTag(asyncFunction.GetInstance(), TagId.DefinitionManaged);
				remoteAsyncFunctionCache.set(namespacedId, asyncFunction);
			}

			this.globalMiddleware?.forEach(mw => asyncFunction._use(mw));
			return asyncFunction;
		} else if (declaration.Type === "Event") {
			let event: ServerEvent;

			// This should make certain use cases cheaper
			if (remoteEventCache.has(namespacedId)) {
				return remoteEventCache.get(namespacedId)!;
			} else {
				if (declaration.ServerMiddleware) {
					event = new ServerEvent(namespacedId, declaration.ServerMiddleware, config);
				} else {
					event = new ServerEvent(namespacedId, undefined, config);
				}
				CollectionService.AddTag(event.GetInstance(), TagId.DefinitionManaged);
				remoteEventCache.set(namespacedId, event);
			}

			this.globalMiddleware?.forEach(mw => event._use(mw));
			return event;
		} else if (declaration.Type === "Messaging") {
			let event: ExperienceBroadcastEvent;
			if (messagingEventCache.has(namespacedId)) {
				return messagingEventCache.get(namespacedId)!;
			} else {
				event = new ExperienceBroadcastEvent(namespacedId);
				messagingEventCache.set(namespacedId, event);
			}

			return event;
		} else if (declaration.Type === "ExperienceEvent") {
			let event: ServerMessagingEvent;
			if (messagingServerEventCache.has(namespacedId)) {
				return messagingServerEventCache.get(namespacedId)!;
			} else {
				event = new ServerMessagingEvent(namespacedId, config);
				messagingServerEventCache.set(namespacedId, event);
			}
			return event;
		} else {
			throw `Unhandled type`;
		}
	}

	/** @internal Used internally by Net. Do not use. */
	private _InitServer() {
		/**
		 * Used to generate all the remotes on the server-side straight away.
		 *
		 * So long as the remote declaration file is imported, and it's the server this _should_ run.
		 *
		 * This will fix https://github.com/roblox-aurora/rbx-net/issues/57, which is a long standing race-condition issue
		 * I, as well as many other users have run into from time to time.
		 */

		$print("Running remote prefetch for", this.namespace);

		const declarations = declarationMap.get(this)! as RemoteDeclarationDict<T>;
		for (const [id, declaration] of pairs(declarations)) {
			switch (declaration.Type) {
				case "Event":
				case "AsyncFunction":
				case "Function":
				case "Messaging":
					this._CreateOrGetInstance(id, declaration);
					break;
				case "Namespace":
					this.GetNamespace(id);
					break;
			}
		}
	}

	/** @internal */
	public toString() {
		return `[${$nameof(ServerDefinitionBuilder)}]`;
	}

	/**
	 * Connects a callback function to this event, in which if any events are recieved by the client will be called.
	 *
	 * @param name The name
	 * @param fn The callback
	 *
	 * Shortcut for:
	 * ```ts
	 * Declaration.Server.Get(name).Connect(fn)
	 * ```
	 */
	public OnEvent<K extends ServerEventDeclarationKeys<T>>(name: K, fn: ServerEventConnectFunction<T, K>) {
		const result = this.Get(name) as InferServerRemote<
			ClientToServerEventDeclaration<any> | BidirectionalEventDeclaration<any, any>
		>;
		return result.Connect(fn);
	}

	/**
	 * Gets the specified group as a definition builder
	 * @param namespaceId The name of the group
	 *
	 * ```ts
	 * const FeatureA = Remotes.Server.Group("FeatureA");
	 * const FeatureAEvent = FeatureA.Get("FeatureAEvent");
	 * ```
	 *
	 */
	public GetNamespace<K extends keyof FilterGroups<T> & string>(
		namespaceId: K,
	): ServerDefinitionBuilder<InferDefinition<T[K]>> {
		const group = declarationMap.get(this)![namespaceId] as NamespaceDeclaration<RemoteDeclarations>;
		assert(group, `Group ${namespaceId} does not exist under namespace ${this.namespace}`);
		assert(group.Type === "Namespace");
		$print(`Fetch Group`, namespaceId);
		return group.Definitions._BuildServerDefinition(
			group.Definitions._CombineConfigurations(this.config),
			this.namespace !== NAMESPACE_ROOT ? [this.namespace, namespaceId].join(NAMESPACE_SEPARATOR) : namespaceId,
		);
	}

	/**
	 * Fetches the remote object with the specified id in this namespace.
	 *
	 * @param remoteId The remote id
	 * @returns The server-side remote object
	 *
	 * @see {@link OnEvent}, {@link OnFunction} for nicer alternatives for event/callback handling.
	 */
	public Get<K extends keyof FilterServerDeclarations<T> & string>(remoteId: K): InferServerRemote<T[K]> {
		const item = declarationMap.get(this)![remoteId];
		assert(item && item.Type, `'${remoteId}' is not defined in this definition.`);
		if (
			item.Type === "Function" ||
			item.Type === "AsyncFunction" ||
			item.Type === "Event" ||
			item.Type === "Messaging"
		) {
			if (remoteAsyncFunctionCache.has(remoteId)) {
				$print(`Fetch cached copy of ${remoteId}`);
				return remoteAsyncFunctionCache.get(remoteId)! as InferServerRemote<T[K]>;
			} else {
				return this._CreateOrGetInstance(remoteId, item) as InferServerRemote<T[K]>;
			}
		} else {
			throw `Invalid type for ${remoteId}`;
		}
	}

	/**
	 * Retrieves the specified server remote instance `remoteId` based on the definition and returns it.
	 *
	 * @param remoteId the id of the remote
	 * @deprecated Use {@link Get}. Remotes are now automatically generated at runtime.
	 *
	 */
	public Create<K extends keyof FilterServerDeclarations<T> & string>(remoteId: K): InferServerRemote<T[K]> {
		return this.Get<K>(remoteId);
	}

	/**
	 * Sets the callback that will be invoked when the client calls this function.
	 *
	 * The returned result will be returned to the client. If the callback is a Promise, it will only return a value if the promise is resolved.
	 *
	 * @param name The name
	 * @param fn The callback
	 *
	 * Shortcut for:
	 * ```ts
	 * Declaration.Server.Create(name).SetCallback(fn)
	 * ```
	 */
	public OnFunction<K extends ServerFunctionDeclarationKeys<T>>(name: K, fn: ServerFunctionCallbackFunction<T, K>) {
		const result = this.Get(name) as InferServerRemote<AsyncServerFunctionDeclaration<any, any>>;
		result.SetCallback(fn);
	}
}
