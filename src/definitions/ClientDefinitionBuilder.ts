import { $nameof } from "rbxts-transform-debug";
import ClientAsyncFunction from "../client/ClientAsyncFunction";
import ClientEvent from "../client/ClientEvent";
import ClientFunction from "../client/ClientFunction";
import {
	AsyncClientFunctionDeclaration,
	DeclarationsOf,
	FilterGroups,
	GroupDeclaration,
	InferClientCallback,
	InferClientConnect,
	InferClientRemote,
	InferGroupDeclaration,
	RemoteDeclarations,
	ServerToClientEventDeclaration,
} from "./Types";

// Keep the declarations fully isolated
const declarationMap = new WeakMap<ClientDefinitionBuilder<RemoteDeclarations>, RemoteDeclarations>();

export class ClientDefinitionBuilder<T extends RemoteDeclarations> {
	public constructor(declarations: T, private namespace = "") {
		declarationMap.set(this, declarations);
	}

	/** @internal */
	public toString() {
		return `[${$nameof(ClientDefinitionBuilder)}]`;
	}

	/**
	 * Gets a client remote from a declaration
	 */
	Get<K extends keyof T & string>(k: K): InferClientRemote<T[K]> {
		const item = declarationMap.get(this)![k];
		k = this.namespace !== "" ? ([this.namespace, k].join(":") as K) : k;
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
	// TODO
	Group<K extends keyof FilterGroups<T> & string>(key: K) {
		const group = declarationMap.get(this)![key] as GroupDeclaration<RemoteDeclarations>;
		assert(group.Type === "Group");
		return new ClientDefinitionBuilder(
			group.Definitions as InferGroupDeclaration<T[K]>,
			this.namespace !== "" ? [this.namespace, key].join(":") : key,
		);
	}

	/**
	 * Waits for the specified remote
	 * @param k The remote id
	 */
	async WaitFor<K extends keyof T & string>(k: K): Promise<InferClientRemote<T[K]>> {
		k = this.namespace !== "" ? ([this.namespace, k].join(":") as K) : k;

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
	 * Connects a callback function to this event, in which if any events are recieved by the server will be called.
	 *
	 * @param name The name
	 * @param fn The callback
	 *
	 * Shortcut for:
	 * ```ts
	 * Declaration.Client.Get(name).Connect(fn)
	 * ```
	 */
	OnEvent<K extends keyof DeclarationsOf<T, ServerToClientEventDeclaration<unknown[]>> & string>(
		name: K,
		fn: InferClientConnect<Extract<T[K], ServerToClientEventDeclaration<unknown[]>>>,
	) {
		const result = this.Get(name) as InferClientRemote<ServerToClientEventDeclaration<any>>;
		result.Connect(fn);
	}

	/**
	 * Sets the callback that will be invoked when the server calls this function.
	 *
	 * The returned result will be returned to the server. If the callback is a Promise, it will only return a value if the promise is resolved.
	 *
	 * @param name The name
	 * @param fn The callback
	 *
	 * Shortcut for:
	 * ```ts
	 * Declaration.Client.Get(name).SetCallback(fn)
	 * ```
	 */
	OnFunction<K extends keyof DeclarationsOf<T, AsyncClientFunctionDeclaration<any, any>> & string>(
		name: K,
		fn: InferClientCallback<Extract<T[K], AsyncClientFunctionDeclaration<any, any>>>,
	) {
		const result = this.Get(name) as InferClientRemote<AsyncClientFunctionDeclaration<any, any>>;
		result.SetCallback(fn);
	}
}
