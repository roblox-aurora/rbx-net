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
	GroupDeclaration,
	InferGroupDeclaration,
	InferServerCallback,
	InferServerConnect,
	InferServerRemote,
	RemoteDeclarations,
} from "./Types";

// Keep the declarations fully isolated
const declarationMap = new WeakMap<ServerDefinitionBuilder<RemoteDeclarations>, RemoteDeclarations>();
const remoteEventCache = new Map<string, ServerEvent>();
const remoteAsyncFunctionCache = new Map<string, ServerAsyncFunction>();
const remoteFunctionCache = new Map<string, ServerFunction>();

export class ServerDefinitionBuilder<T extends RemoteDeclarations> {
	public constructor(declarations: T, private globalMiddleware?: NetGlobalMiddleware[], private namespace = "") {
		declarationMap.set(this, declarations);
		$dbg(declarations, (value, source) => {
			print(`[${source.file}:${source.lineNumber}]`, "== Server Declarations ==");
			for (const [name, va] of pairs(value)) {
				print(`[${source.file}:${source.lineNumber}]`, name, va.Type);
			}
		});
	}

	public toString() {
		return `[${$nameof(ServerDefinitionBuilder)}]`;
	}

	/**
	 * Create a receive-only event for the server.
	 *
	 * @param name The name
	 * @param fn The callback
	 *
	 * Shortcut for:
	 * ```ts
	 * Declaration.CreateServer(name).Connect(fn)
	 * ```
	 */
	OnEvent<
		K extends keyof DeclarationsOf<
			FilterDeclarations<T>,
			ClientToServerEventDeclaration<any> | BidirectionalEventDeclaration<any, any>
		> &
			string
	>(
		name: K,
		fn: InferServerConnect<
			Extract<T[K], ClientToServerEventDeclaration<any> | BidirectionalEventDeclaration<any, any>>
		>,
	) {
		const result = this.Create(name) as InferServerRemote<
			ClientToServerEventDeclaration<any> | BidirectionalEventDeclaration<any, any>
		>;
		result.Connect(fn);
	}

	/**
	 * Gets the specified group as a definition builder
	 * @internal
	 * @param key The name of the group
	 *
	 * ```ts
	 * const FeatureA = Remotes.Server.Group("FeatureA");
	 * const FeatureAEvent = FeatureA.Create("FeatureAEvent");
	 * ```
	 *
	 */
	// TODO
	Group<K extends keyof FilterGroups<T> & string>(key: K) {
		const group = declarationMap.get(this)![key] as GroupDeclaration<RemoteDeclarations>;
		assert(group.Type === "Group");
		$print(`Fetch Group`, key);
		return new ServerDefinitionBuilder(
			group.Definitions as InferGroupDeclaration<T[K]>,
			this.globalMiddleware,
			this.namespace !== "" ? [this.namespace, key].join(":") : key,
		);
	}

	/**
	 * Creates a server remote from a declaration
	 */
	Create<K extends keyof FilterDeclarations<T> & string>(k: K): InferServerRemote<T[K]> {
		const item = declarationMap.get(this)![k];
		k = this.namespace !== "" ? ([this.namespace, k].join(":") as K) : k;
		assert(item && item.Type, `'${k}' is not defined in this definition.`);
		if (item.Type === "Function") {
			let func: ServerFunction;

			// This should make certain use cases cheaper
			if (remoteFunctionCache.has(k)) {
				$print(`Fetch cached copy of ${k}`);
				return remoteFunctionCache.get(k)! as InferServerRemote<T[K]>;
			} else {
				if (item.ServerMiddleware) {
					func = new ServerFunction(k, item.ServerMiddleware);
				} else {
					func = new ServerFunction(k);
				}
				remoteFunctionCache.set(k, func);
			}

			this.globalMiddleware?.forEach((mw) => func._use(mw));
			return func as InferServerRemote<T[K]>;
		} else if (item.Type === "AsyncFunction") {
			let asyncFunction: ServerAsyncFunction;

			// This should make certain use cases cheaper
			if (remoteAsyncFunctionCache.has(k)) {
				$print(`Fetch cached copy of ${k}`);
				return remoteAsyncFunctionCache.get(k)! as InferServerRemote<T[K]>;
			} else {
				if (item.ServerMiddleware) {
					asyncFunction = new ServerAsyncFunction(k, item.ServerMiddleware);
				} else {
					asyncFunction = new ServerAsyncFunction(k);
				}
				remoteAsyncFunctionCache.set(k, asyncFunction);
			}

			this.globalMiddleware?.forEach((mw) => asyncFunction._use(mw));
			return asyncFunction as InferServerRemote<T[K]>;
		} else if (item.Type === "Event") {
			let event: ServerEvent;

			// This should make certain use cases cheaper
			if (remoteEventCache.has(k)) {
				$print(`Fetch cached copy of ${k}`);
				return remoteEventCache.get(k)! as InferServerRemote<T[K]>;
			} else {
				if (item.ServerMiddleware) {
					event = new ServerEvent(k, item.ServerMiddleware);
				} else {
					event = new ServerEvent(k);
				}
			}

			this.globalMiddleware?.forEach((mw) => event._use(mw));
			return event as InferServerRemote<T[K]>;
		}

		throw `Invalid Type`;
	}

	/** @internal */
	OnFunction<
		K extends keyof DeclarationsOf<FilterDeclarations<T>, AsyncServerFunctionDeclaration<any, any>> & string
	>(name: K, fn: InferServerCallback<Extract<T[K], AsyncServerFunctionDeclaration<any, any>>>) {
		const result = this.Create(name) as InferServerRemote<AsyncServerFunctionDeclaration<any, any>>;
		result.SetCallback(fn);
	}
}
