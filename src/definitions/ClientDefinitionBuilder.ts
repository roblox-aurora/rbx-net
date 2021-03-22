import { $nameof } from "rbxts-transform-debug";
import ClientAsyncFunction from "../client/ClientAsyncFunction";
import ClientEvent from "../client/ClientEvent";
import ClientFunction from "../client/ClientFunction";
import { InferDefinition, ToClientBuilder } from "./NamespaceBuilder";
import {
	AsyncClientFunctionDeclaration,
	DeclarationsOf,
	FilterGroups,
	NamespaceDeclaration,
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
	 * Gets the specified client remote instance `remoteId` based on the definition and returns it.
	 *
	 * @throws If the equivalent `Create(remoteId)` has not been called on the server, this will throw an error.
	 *
	 * @param remoteId The id of the remote
	 */
	Get<K extends keyof T & string>(remoteId: K): InferClientRemote<T[K]> {
		const item = declarationMap.get(this)![remoteId];
		remoteId = this.namespace !== "" ? ([this.namespace, remoteId].join(":") as K) : remoteId;
		assert(item && item.Type, `'${remoteId}' is not defined in this definition.`);
		if (item.Type === "Function") {
			return new ClientFunction(remoteId) as InferClientRemote<T[K]>;
		} else if (item.Type === "AsyncFunction") {
			return new ClientAsyncFunction(remoteId) as InferClientRemote<T[K]>;
		} else if (item.Type === "Event") {
			return new ClientEvent(remoteId) as InferClientRemote<T[K]>;
		}

		throw `Invalid Type`;
	}

	/**
	 * Gets the specified remote declaration group (or sub group) in which namespaced remotes can be accessed
	 * @param groupName The group name
	 */
	GetNamespace<K extends keyof FilterGroups<T> & string>(
		groupName: K,
	): ClientDefinitionBuilder<InferDefinition<T[K]>> {
		const group = declarationMap.get(this)![groupName] as NamespaceDeclaration<RemoteDeclarations>;
		assert(group.Type === "Namespace");
		return group.Definitions._buildClientDefinition(
			this.namespace !== "" ? [this.namespace, groupName].join(":") : groupName,
		);
	}

	/**
	 * Waits for the specified remote
	 * @param remoteId The remote id
	 */
	async WaitFor<K extends keyof T & string>(remoteId: K): Promise<InferClientRemote<T[K]>> {
		remoteId = this.namespace !== "" ? ([this.namespace, remoteId].join(":") as K) : remoteId;

		const item = declarationMap.get(this)![remoteId];
		assert(item && item.Type, `'${remoteId}' is not defined in this definition.`);
		if (item.Type === "Function") {
			return ClientFunction.Wait(remoteId) as Promise<InferClientRemote<T[K]>>;
		} else if (item.Type === "Event") {
			return ClientEvent.Wait(remoteId) as Promise<InferClientRemote<T[K]>>;
		} else if (item.Type === "AsyncFunction") {
			return ClientAsyncFunction.Wait(remoteId) as Promise<InferClientRemote<T[K]>>;
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
