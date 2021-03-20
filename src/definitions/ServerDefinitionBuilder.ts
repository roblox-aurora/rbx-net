import { $dbg, $nameof, $print } from "rbxts-transform-debug";
import ServerAsyncFunction from "../server/ServerAsyncFunction";
import ServerEvent from "../server/ServerEvent";
import ServerFunction from "../server/ServerFunction";
import {
	AsyncFunctionDeclarationLike,
	AsyncServerFunctionDeclaration,
	BidirectionalEventDeclaration,
	ClientToServerEventDeclaration,
	DeclarationGroup,
	DeclarationGroupLike,
	DeclarationsOf,
	EventDeclarationLike,
	FilterDeclarations,
	FilterGroups,
	InferGroupDeclaration,
	InferServerCallback,
	InferServerConnect,
	InferServerRemote,
	RemoteDeclarations,
	ServerToClientEventDeclaration,
} from "./Types";

// Keep the declarations fully isolated
const declarationMap = new WeakMap<ServerDefinitionBuilder<RemoteDeclarations>, RemoteDeclarations>();

export class ServerDefinitionBuilder<T extends RemoteDeclarations> {
	public constructor(declarations: T) {
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
		const group = declarationMap.get(this)![key] as DeclarationGroupLike;
		assert(group.Type === "Group");
		$print(`Fetch Group`, key);
		return new ServerDefinitionBuilder(group.Definitions as InferGroupDeclaration<T[K]>);
	}

	/**
	 * Creates a server remote from a declaration
	 */
	Create<K extends keyof FilterDeclarations<T> & string>(k: K): InferServerRemote<T[K]> {
		const item = declarationMap.get(this)![k];
		assert(item && item.Type, `'${k}' is not defined in this definition.`);
		if (item.Type === "Function") {
			if (item.ServerMiddleware) {
				return new ServerFunction(k, item.ServerMiddleware) as InferServerRemote<T[K]>;
			} else {
				return new ServerFunction(k) as InferServerRemote<T[K]>;
			}
		} else if (item.Type === "AsyncFunction") {
			if (item.ServerMiddleware) {
				return new ServerAsyncFunction(k, item.ServerMiddleware) as InferServerRemote<T[K]>;
			} else {
				return new ServerAsyncFunction(k) as InferServerRemote<T[K]>;
			}
		} else if (item.Type === "Event") {
			if (item.ServerMiddleware) {
				return new ServerEvent(k, item.ServerMiddleware) as InferServerRemote<T[K]>;
			} else {
				return new ServerEvent(k) as InferServerRemote<T[K]>;
			}
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
