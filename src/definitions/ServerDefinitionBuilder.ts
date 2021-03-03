import ServerAsyncFunction from "../server/ServerAsyncFunction";
import ServerEvent from "../server/ServerEvent";
import ServerFunction from "../server/ServerFunction";
import {
	AsyncFunctionDeclarationLike,
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
} from "./Types";

// Keep the declarations fully isolated
const declarationMap = new WeakMap<ServerDefinitionBuilder<RemoteDeclarations>, RemoteDeclarations>();

export class ServerDefinitionBuilder<T extends RemoteDeclarations> {
	public constructor(declarations: T) {
		declarationMap.set(this, declarations);
	}

	/**
	 * Create a receive-only event for the server.
	 *
	 * @internal
	 *
	 * @param name The name
	 * @param fn The callback
	 *
	 * Shortcut for:
	 * ```ts
	 * Declaration.CreateServer(name).Connect(fn)
	 * ```
	 */
	OnEvent<K extends keyof DeclarationsOf<FilterDeclarations<T>, EventDeclarationLike> & string>(
		name: K,
		fn: InferServerConnect<Extract<T[K], EventDeclarationLike>>,
	) {
		const result = this.Create(name) as InferServerRemote<EventDeclarationLike>;
		result.Connect(fn);
	}

	/**
	 * @internal
	 * @param k
	 */
	GetGroup<K extends keyof FilterGroups<T> & string>(key: K) {
		const group = declarationMap.get(this)![key] as DeclarationGroupLike;
		assert(group.Type === "Group");
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
	OnFunction<K extends keyof DeclarationsOf<FilterDeclarations<T>, AsyncFunctionDeclarationLike> & string>(
		name: K,
		fn: InferServerCallback<Extract<T[K], AsyncFunctionDeclarationLike>>,
	) {
		const result = this.Create(name) as InferServerRemote<AsyncFunctionDeclarationLike>;
		result.SetCallback(fn);
	}
}
