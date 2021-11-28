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
	InferServerCallback,
	InferServerConnect,
	InferServerRemote,
	RemoteDeclarations,
	DeclarationLike,
	DeclarationNamespaceLike,
} from "./Types";
import { TagId } from "../internal";
import { InferDefinition } from "./NamespaceBuilder";
const CollectionService = game.GetService("CollectionService");
const RunService = game.GetService("RunService");

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

type RemoteDeclarationDict<T extends RemoteDeclarations> =
	| Record<keyof FilterDeclarations<T> & string, DeclarationLike>
	| Record<keyof FilterGroups<T> & string, DeclarationNamespaceLike>;

// Keep the declarations fully isolated
const declarationMap = new WeakMap<ServerDefinitionBuilder<RemoteDeclarations>, RemoteDeclarations>();
const remoteEventCache = new Map<string, ServerEvent>();
const remoteAsyncFunctionCache = new Map<string, ServerAsyncFunction>();
const remoteFunctionCache = new Map<string, ServerFunction>();
const ROOT_NAMESPACE_ID = "@";

export class ServerDefinitionBuilder<T extends RemoteDeclarations> {
	public constructor(
		declarations: T,
		private globalMiddleware?: NetGlobalMiddleware[],
		private namespace = ROOT_NAMESPACE_ID,
	) {
		declarationMap.set(this, declarations);
		$dbg(declarations, (value, source) => {
			print(`[${source.file}:${source.lineNumber}]`, "== Server Declarations ==");
			for (const [name, va] of pairs(value)) {
				print(`[${source.file}:${source.lineNumber}]`, name, va.Type);
			}
		});

		// We only run remote creation on the server
		if (RunService.IsServer()) {
			this._InitServer();
		}
	}

	/** @internal Used internally by Net. Do not use. */
	private _CreateOrGetRemote(id: string, declaration: DeclarationLike) {
		/**
		 * This is used to generate or fetch the specified remote from a declaration
		 *
		 * The generated remote id is based off the current namespace.
		 */

		const remoteInstanceId =
			this.namespace !== ROOT_NAMESPACE_ID
				? ([this.namespace, id].join(":") as keyof RemoteDeclarationDict<T>)
				: id;

		if (declaration.Type === "Function") {
			let func: ServerFunction;

			if (remoteFunctionCache.has(remoteInstanceId)) {
				return remoteFunctionCache.get(remoteInstanceId)!;
			} else {
				if (declaration.ServerMiddleware) {
					func = new ServerFunction(remoteInstanceId, declaration.ServerMiddleware);
				} else {
					func = new ServerFunction(remoteInstanceId);
				}
				CollectionService.AddTag(func.GetInstance(), TagId.DefinitionManaged);
				remoteFunctionCache.set(remoteInstanceId, func);

				this.globalMiddleware?.forEach((mw) => func._use(mw));
				return func;
			}
		} else if (declaration.Type === "AsyncFunction") {
			let asyncFunction: ServerAsyncFunction;

			// This should make certain use cases cheaper
			if (remoteAsyncFunctionCache.has(remoteInstanceId)) {
				return remoteAsyncFunctionCache.get(remoteInstanceId)!;
			} else {
				if (declaration.ServerMiddleware) {
					asyncFunction = new ServerAsyncFunction(remoteInstanceId, declaration.ServerMiddleware);
				} else {
					asyncFunction = new ServerAsyncFunction(remoteInstanceId);
				}
				CollectionService.AddTag(asyncFunction.GetInstance(), TagId.DefinitionManaged);
				remoteAsyncFunctionCache.set(remoteInstanceId, asyncFunction);
			}

			this.globalMiddleware?.forEach((mw) => asyncFunction._use(mw));
			return asyncFunction;
		} else if (declaration.Type === "Event") {
			let event: ServerEvent;

			// This should make certain use cases cheaper
			if (remoteEventCache.has(remoteInstanceId)) {
				return remoteEventCache.get(remoteInstanceId)!;
			} else {
				if (declaration.ServerMiddleware) {
					event = new ServerEvent(remoteInstanceId, declaration.ServerMiddleware);
				} else {
					event = new ServerEvent(remoteInstanceId);
				}
				CollectionService.AddTag(event.GetInstance(), TagId.DefinitionManaged);
				remoteEventCache.set(remoteInstanceId, event);
			}

			this.globalMiddleware?.forEach((mw) => event._use(mw));
			return event;
		} else {
			throw `Invalid type`;
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
			const remoteInstanceId =
				this.namespace !== ROOT_NAMESPACE_ID
					? ([this.namespace, id].join(":") as keyof RemoteDeclarationDict<T>)
					: id;

			$print("Generating server-side remote", this.namespace, id, "as", remoteInstanceId);

			switch (declaration.Type) {
				case "Event":
				case "AsyncFunction":
				case "Function":
					this._CreateOrGetRemote(id, declaration);
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
		result.Connect(fn);
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
		return group.Definitions._buildServerDefinition(
			this.globalMiddleware,
			this.namespace !== "" ? [this.namespace, namespaceId].join(":") : namespaceId,
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
	public Get<K extends keyof FilterDeclarations<T> & string>(remoteId: K): InferServerRemote<T[K]> {
		const item = declarationMap.get(this)![remoteId];
		remoteId = this.namespace !== ROOT_NAMESPACE_ID ? ([this.namespace, remoteId].join(":") as K) : remoteId;
		assert(item && item.Type, `'${remoteId}' is not defined in this definition.`);
		if (item.Type === "Function") {
			if (remoteFunctionCache.has(remoteId)) {
				$print(`Fetch cached copy of ${remoteId}`);
				return remoteFunctionCache.get(remoteId)! as InferServerRemote<T[K]>;
			} else {
				throw `Failed to fetch remote ${remoteId}`;
			}
		} else if (item.Type === "AsyncFunction") {
			if (remoteAsyncFunctionCache.has(remoteId)) {
				$print(`Fetch cached copy of ${remoteId}`);
				return remoteAsyncFunctionCache.get(remoteId)! as InferServerRemote<T[K]>;
			} else {
				throw `Failed to fetch remote ${remoteId}`;
			}
		} else if (item.Type === "Event") {
			if (remoteEventCache.has(remoteId)) {
				$print(`Fetch cached copy of ${remoteId}`);
				return remoteEventCache.get(remoteId)! as InferServerRemote<T[K]>;
			} else {
				throw `Failed to fetch remote ${remoteId}`;
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
	public Create<K extends keyof FilterDeclarations<T> & string>(remoteId: K): InferServerRemote<T[K]> {
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
