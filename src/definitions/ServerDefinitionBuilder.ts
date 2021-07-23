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
	FilterDeclarations,
	FilterGroups,
	NamespaceDeclaration,
	InferGroupDeclaration,
	InferServerCallback,
	InferServerConnect,
	InferServerRemote,
	RemoteDeclarations,
	DeclarationLike,
} from "./Types";
import { TagId } from "../internal";
import { InferDefinition } from "./NamespaceBuilder";
import NetSerialization from "../serialization";
import NetDefinitions from ".";
const CollectionService = game.GetService("CollectionService");

// Tidy up all the types here.
type ServerEventDeclarationKeys<T extends RemoteDeclarations> = keyof DeclarationsOf<
	FilterDeclarations<T>,
	ClientToServerEventDeclaration<any> | BidirectionalEventDeclaration<any, any>
> &
	string;

type ServerEventConnectFunction<T extends RemoteDeclarations, K extends keyof T> = InferServerConnect<
	Extract<T[K], ClientToServerEventDeclaration<any> | BidirectionalEventDeclaration<any, any>>
>;

type ServerFunctionDeclarationKeys<T extends RemoteDeclarations> = keyof DeclarationsOf<
	FilterDeclarations<T>,
	AsyncServerFunctionDeclaration<any, any>
> &
	string;

type ServerFunctionCallbackFunction<T extends RemoteDeclarations, K extends keyof T> = InferServerCallback<
	Extract<T[K], AsyncServerFunctionDeclaration<any, any>>
>;

// Keep the declarations fully isolated
const declarationMap = new WeakMap<ServerDefinitionBuilder<RemoteDeclarations>, RemoteDeclarations>();
const remoteEventCache = new Map<string, ServerEvent>();
const remoteAsyncFunctionCache = new Map<string, ServerAsyncFunction>();
const remoteFunctionCache = new Map<string, ServerFunction>();

export class ServerDefinitionBuilder<T extends RemoteDeclarations> {
	private globalMiddleware?: NetGlobalMiddleware[];
	private serializers?: NetSerialization.Serializer<any, any>[];

	public constructor(declarations: T, private options?: NetDefinitions.CreateOptions, private namespace = "") {
		this.serializers = options?.Serializers;
		this.globalMiddleware = options?.GlobalMiddleware;

		declarationMap.set(this, declarations);
		$dbg(declarations, (value, source) => {
			print(`[${source.file}:${source.lineNumber}]`, "== Server Declarations ==");
			for (const [name, va] of pairs(value)) {
				print(`[${source.file}:${source.lineNumber}]`, name, va.Type);
			}
		});
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
	 * Declaration.Server.Create(name).Connect(fn)
	 * ```
	 */
	public OnEvent<K extends ServerEventDeclarationKeys<T>>(name: K, fn: ServerEventConnectFunction<T, K>) {
		const result = this.Create(name) as InferServerRemote<
			ClientToServerEventDeclaration<any> | BidirectionalEventDeclaration<any, any>
		>;
		result.Connect(fn);
	}

	/**
	 * Gets the specified group as a definition builder
	 * @param groupId The name of the group
	 *
	 * ```ts
	 * const FeatureA = Remotes.Server.Group("FeatureA");
	 * const FeatureAEvent = FeatureA.Create("FeatureAEvent");
	 * ```
	 *
	 */
	public GetNamespace<K extends keyof FilterGroups<T> & string>(
		groupId: K,
	): ServerDefinitionBuilder<InferDefinition<T[K]>> {
		const group = declarationMap.get(this)![groupId] as NamespaceDeclaration<RemoteDeclarations>;
		assert(group.Type === "Namespace");
		$print(`Fetch Group`, groupId);
		return group.Definitions._buildServerDefinition(
			this.options,
			this.namespace !== "" ? [this.namespace, groupId].join(":") : groupId,
		);
	}

	/**
	 * Creates or retrieves the specified server remote instance `remoteId` based on the definition and returns it.
	 *
	 * _The created remote will be cached_
	 *
	 * @param remoteId the id of the remote
	 *
	 */
	public Create<K extends keyof FilterDeclarations<T> & string>(remoteId: K): InferServerRemote<T[K]> {
		const item = declarationMap.get(this)![remoteId];
		remoteId = this.namespace !== "" ? ([this.namespace, remoteId].join(":") as K) : remoteId;
		assert(item && item.Type, `'${remoteId}' is not defined in this definition.`);
		if (item.Type === "Function") {
			let func: ServerFunction;

			// This should make certain use cases cheaper
			if (remoteFunctionCache.has(remoteId)) {
				$print(`Fetch cached copy of ${remoteId}`);
				return remoteFunctionCache.get(remoteId)! as InferServerRemote<T[K]>;
			} else {
				if (item.ServerMiddleware) {
					func = new ServerFunction(remoteId, item.ServerMiddleware);
				} else {
					func = new ServerFunction(remoteId);
				}
				CollectionService.AddTag(func.GetInstance(), TagId.DefinitionManaged);
				remoteFunctionCache.set(remoteId, func);
			}

			this.globalMiddleware?.forEach((mw) => func._use(mw));
			return func as InferServerRemote<T[K]>;
		} else if (item.Type === "AsyncFunction") {
			let asyncFunction: ServerAsyncFunction;

			// This should make certain use cases cheaper
			if (remoteAsyncFunctionCache.has(remoteId)) {
				$print(`Fetch cached copy of ${remoteId}`);
				return remoteAsyncFunctionCache.get(remoteId)! as InferServerRemote<T[K]>;
			} else {
				if (item.ServerMiddleware) {
					asyncFunction = new ServerAsyncFunction(remoteId, item.ServerMiddleware);
				} else {
					asyncFunction = new ServerAsyncFunction(remoteId);
				}
				CollectionService.AddTag(asyncFunction.GetInstance(), TagId.DefinitionManaged);
				remoteAsyncFunctionCache.set(remoteId, asyncFunction);
			}

			this.globalMiddleware?.forEach((mw) => asyncFunction._use(mw));
			return asyncFunction as InferServerRemote<T[K]>;
		} else if (item.Type === "Event") {
			let event: ServerEvent;

			// This should make certain use cases cheaper
			if (remoteEventCache.has(remoteId)) {
				$print(`Fetch cached copy of ${remoteId}`);
				return remoteEventCache.get(remoteId)! as InferServerRemote<T[K]>;
			} else {
				if (item.ServerMiddleware) {
					event = new ServerEvent(remoteId, item.ServerMiddleware);
				} else {
					event = new ServerEvent(remoteId);
				}
				CollectionService.AddTag(event.GetInstance(), TagId.DefinitionManaged);
				remoteEventCache.set(remoteId, event);
			}

			this.globalMiddleware?.forEach((mw) => event._use(mw));
			return event as InferServerRemote<T[K]>;
		}

		throw `Invalid Type`;
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
		const result = this.Create(name) as InferServerRemote<AsyncServerFunctionDeclaration<any, any>>;
		result.SetCallback(fn);
	}
}
