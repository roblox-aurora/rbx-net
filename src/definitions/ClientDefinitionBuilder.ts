import ClientAsyncFunction from "../client/ClientAsyncFunction";
import ClientEvent from "../client/ClientEvent";
import ClientFunction from "../client/ClientFunction";
import {
	AsyncFunctionDeclarationLike,
	DeclarationGroupLike,
	DeclarationLike,
	DeclarationsOf,
	EventDeclarationLike,
	FilterGroups,
	InferClientCallback,
	InferClientConnect,
	InferClientRemote,
	InferGroupDeclaration,
	RemoteDeclarations,
} from "./Types";

const declarationMap = new WeakMap<ClientDefinitionBuilder<RemoteDeclarations>, RemoteDeclarations>();

export class ClientDefinitionBuilder<T extends RemoteDeclarations> {
	public constructor(declarations: T) {
		declarationMap.set(this, declarations);
	}
	/**
	 * Gets a client remote from a declaration
	 */
	Get<K extends keyof T & string>(k: K): InferClientRemote<T[K]> {
		const item = declarationMap.get(this)![k];
		assert(item && item.Type, `'${k}' is not defined in this definition.`);
		if (item.Type === "Function") {
			return new ClientFunction(k) as InferClientRemote<T[K]>;
		} else if (item.Type === "AsyncFunction") {
			return new ClientAsyncFunction(k) as InferClientRemote<T[K]>;
		} else if (item.Type === "Event") {
			return new ClientEvent(k) as InferClientRemote<T[K]>;
		}

		throw `Invalid Type`;
	}

	/**
	 * @internal
	 * @param k
	 */
	GetGroup<K extends keyof FilterGroups<T> & string>(key: K) {
		const group = declarationMap.get(this)![key] as DeclarationGroupLike;
		assert(group.Type === "Group");
		return new ClientDefinitionBuilder(group.Definitions as InferGroupDeclaration<T[K]>);
	}

	/**
	 * Waits for the specified remote
	 * @param k The remote id
	 */
	async WaitFor<K extends keyof T & string>(k: K): Promise<InferClientRemote<T[K]>> {
		const item = declarationMap.get(this)![k];
		assert(item && item.Type, `'${k}' is not defined in this definition.`);
		if (item.Type === "Function") {
			return ClientFunction.Wait(k) as Promise<InferClientRemote<T[K]>>;
		} else if (item.Type === "Event") {
			return ClientEvent.Wait(k) as Promise<InferClientRemote<T[K]>>;
		} else if (item.Type === "AsyncFunction") {
			return ClientAsyncFunction.Wait(k) as Promise<InferClientRemote<T[K]>>;
		}

		throw `Invalid Type`;
	}

	/**
	 * Create a receive-only event for the client.
	 *
	 * @internal
	 *
	 * @param name The name
	 * @param fn The callback
	 *
	 * Shortcut for:
	 * ```ts
	 * Declaration.GetClient(name).Connect(fn)
	 * ```
	 */
	OnEvent<K extends keyof DeclarationsOf<T, EventDeclarationLike> & string>(
		name: K,
		fn: InferClientConnect<Extract<T[K], EventDeclarationLike>>,
	) {
		const result = this.Get(name) as InferClientRemote<EventDeclarationLike>;
		result.Connect(fn);
	}

	/** @internal */
	OnFunction<K extends keyof DeclarationsOf<T, AsyncFunctionDeclarationLike> & string>(
		name: K,
		fn: InferClientCallback<Extract<T[K], AsyncFunctionDeclarationLike>>,
	) {
		const result = this.Get(name) as InferClientRemote<AsyncFunctionDeclarationLike>;
		result.SetCallback(fn);
	}
}
