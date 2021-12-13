import { $nameof, $print } from "rbxts-transform-debug";
import ClientAsyncFunction from "../client/ClientAsyncFunction";
import ClientEvent from "../client/ClientEvent";
import ClientFunction from "../client/ClientFunction";
import { NAMESPACE_ROOT, NAMESPACE_SEPARATOR } from "../internal";
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
	public constructor(declarations: T, private namespace = NAMESPACE_ROOT) {
		declarationMap.set(this, declarations);
	}

	/** @internal */
	public toString() {
		return `[${$nameof(ClientDefinitionBuilder)}]`;
	}

	/**
	 * (Internally uses {@link WaitFor})
	 *
	 * Will yield the current thread until the remote is found, or after 60 seconds will error.
	 *
	 * If you want to fetch the remote asynchronously, please use {@link WaitFor} instead.
	 *
	 * @param remoteId The id of the remote
	 *
	 * @see {@link OnEvent}, {@link OnFunction} for nicer functional alternatives to grabbing remotes.
	 */
	Get<K extends keyof T & string>(remoteId: K): InferClientRemote<T[K]> {
		return this.WaitFor(remoteId).expect();
	}

	/**
	 * Gets the specified remote declaration group (or sub group) in which namespaced remotes can be accessed
	 * @param namespaceId The group name
	 */
	GetNamespace<K extends keyof FilterGroups<T> & string>(
		namespaceId: K,
	): ClientDefinitionBuilder<InferDefinition<T[K]>> {
		const group = declarationMap.get(this)![namespaceId] as NamespaceDeclaration<RemoteDeclarations>;
		assert(group, `Group ${namespaceId} does not exist under namespace ${this.namespace}`);
		assert(group.Type === "Namespace");
		return group.Definitions._BuildClientDefinition(
			this.namespace !== NAMESPACE_ROOT ? [this.namespace, namespaceId].join(NAMESPACE_SEPARATOR) : namespaceId,
		);
	}

	/**
	 * Waits for the specified remote to exist, then returns it in a promises
	 *
	 * @param remoteId The remote id
	 *
	 * @see {@link OnEvent}, {@link OnFunction} for nicer functional alternatives to grabbing remotes.
	 */

	async WaitFor<K extends keyof T & string>(remoteId: K): Promise<InferClientRemote<T[K]>> {
		const item = declarationMap.get(this)![remoteId];
		remoteId =
			this.namespace !== NAMESPACE_ROOT ? ([this.namespace, remoteId].join(NAMESPACE_SEPARATOR) as K) : remoteId;

		assert(item && item.Type, `'${remoteId}' is not defined in this definition.`);

		$print(`WaitFor(${remoteId}) {${item.Type}~'${remoteId}'}`);

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
	 * Declaration.Client.WaitFor(name).expect().Connect(fn)
	 * ```
	 */
	async OnEvent<K extends keyof DeclarationsOf<T, ServerToClientEventDeclaration<unknown[]>> & string>(
		name: K,
		fn: InferClientConnect<Extract<T[K], ServerToClientEventDeclaration<unknown[]>>>,
	) {
		const result = (await this.WaitFor(name)) as InferClientRemote<ServerToClientEventDeclaration<any>>;
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
	 * Declaration.Client.WaitFor(name).expect().SetCallback(fn)
	 * ```
	 */
	async OnFunction<K extends keyof DeclarationsOf<T, AsyncClientFunctionDeclaration<any, any>> & string>(
		name: K,
		fn: InferClientCallback<Extract<T[K], AsyncClientFunctionDeclaration<any, any>>>,
	) {
		const result = (await this.WaitFor(name)) as InferClientRemote<AsyncClientFunctionDeclaration<any, any>>;
		result.SetCallback(fn);
	}
}
