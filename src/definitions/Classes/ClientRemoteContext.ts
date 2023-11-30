/* eslint-disable @typescript-eslint/no-explicit-any */
import { $nameof } from "rbxts-transform-debug";
import { NetworkModelConfiguration } from "..";
import ClientAsyncFunction from "../../client/ClientAsyncFunction";
import ClientEvent from "../../client/ClientEvent";
import ClientFunction from "../../client/ClientFunction";
import { getGlobalRemote, NAMESPACE_ROOT, NAMESPACE_SEPARATOR } from "../../internal";
import { InferDefinition } from "./NamespaceGenerator";
import {
	AsyncClientFunctionDeclaration,
	DeclarationsOf,
	FilterGroups,
	NamespaceDeclaration,
	InferClientCallback,
	InferClientConnect,
	InferClientRemote,
	RemoteDeclarations,
	ServerToClientEventDeclaration,
	FilterClientDeclarations,
} from "../Types";
import UnreliableClientEvent from "../../client/UnreliableClientEvent";

// Keep the declarations fully isolated
const declarationMap = new WeakMap<ClientRemoteContext<RemoteDeclarations>, RemoteDeclarations>();
const shouldYield = new WeakMap<ClientRemoteContext<RemoteDeclarations>, boolean>();

export class ClientRemoteContext<T extends RemoteDeclarations> {
	public constructor(
		declarations: T,
		private configuration: NetworkModelConfiguration,
		private namespace = NAMESPACE_ROOT,
	) {
		declarationMap.set(this, declarations);
		shouldYield.set(this, configuration?.ClientGetShouldYield ?? true);
	}

	/** @internal */
	public toString() {
		return `[${$nameof(ClientRemoteContext)}]`;
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
	public Get<K extends keyof FilterClientDeclarations<T> & string>(remoteId: K): InferClientRemote<T[K]> {
		if (shouldYield.get(this)) {
			return this.WaitFor(remoteId).expect();
		} else {
			return this.GetOrThrow(remoteId);
		}
	}

	/**
	 * Gets the specified remote declaration group (or sub group) in which namespaced remotes can be accessed
	 * @param namespaceId The group name
	 */
	public GetNamespace<K extends keyof FilterGroups<T> & string>(
		namespaceId: K,
	): ClientRemoteContext<InferDefinition<T[K]>> {
		const group = declarationMap.get(this)![namespaceId] as NamespaceDeclaration<RemoteDeclarations>;
		assert(group, `Group ${namespaceId} does not exist under namespace ${this.namespace}`);
		assert(group.Type === "Namespace");
		return group.Namespace._GenerateClientContext(
			group.Namespace._CombineConfigurations(this.configuration),
			this.namespace !== NAMESPACE_ROOT ? [this.namespace, namespaceId].join(NAMESPACE_SEPARATOR) : namespaceId,
		);
	}

	private GetOrThrow<K extends keyof FilterClientDeclarations<T> & string>(remoteId: K): InferClientRemote<T[K]> {
		const item = declarationMap.get(this)![remoteId];
		remoteId =
			this.namespace !== NAMESPACE_ROOT ? ([this.namespace, remoteId].join(NAMESPACE_SEPARATOR) as K) : remoteId;

		assert(item && item.Type, `'${remoteId}' is not defined in this definition.`);

		if (item.Type === "Function") {
			return new ClientFunction(remoteId, this.configuration) as InferClientRemote<T[K]>;
		} else if (item.Type === "Event") {
			if (item.Unreliable) {
				return new UnreliableClientEvent(
					remoteId,
					item.ClientMiddleware,
					this.configuration,
				) as never as InferClientRemote<T[K]>;
			} else {
				return new ClientEvent(remoteId, item.ClientMiddleware, this.configuration) as InferClientRemote<T[K]>;
			}
		} else if (item.Type === "AsyncFunction") {
			return new ClientAsyncFunction(remoteId, item.ClientMiddleware, this.configuration) as InferClientRemote<
				T[K]
			>;
		} else if (item.Type === "ExperienceEvent") {
			return new ClientEvent(getGlobalRemote(remoteId), undefined, this.configuration) as InferClientRemote<T[K]>;
		}

		throw `Type '${item.Type}' is not a valid client remote object type`;
	}

	/**
	 * Waits for the specified remote to exist, then returns it in a promises
	 *
	 * @param remoteId The remote id
	 *
	 * @see {@link OnEvent}, {@link OnFunction} for nicer functional alternatives to grabbing remotes.
	 */

	public async WaitFor<K extends keyof FilterClientDeclarations<T> & string>(
		remoteId: K,
	): Promise<InferClientRemote<T[K]>> {
		const item = declarationMap.get(this)![remoteId];
		remoteId =
			this.namespace !== NAMESPACE_ROOT ? ([this.namespace, remoteId].join(NAMESPACE_SEPARATOR) as K) : remoteId;

		assert(item && item.Type, `'${remoteId}' is not defined in this definition.`);

		if (item.Type === "Function") {
			return ClientFunction.Wait(remoteId, this.configuration) as Promise<InferClientRemote<T[K]>>;
		} else if (item.Type === "Event") {
			return ClientEvent.Wait(remoteId, this.configuration) as Promise<InferClientRemote<T[K]>>;
		} else if (item.Type === "AsyncFunction") {
			return ClientAsyncFunction.Wait(remoteId, this.configuration) as Promise<InferClientRemote<T[K]>>;
		} else if (item.Type === "ExperienceEvent") {
			return ClientEvent.Wait(getGlobalRemote(remoteId), this.configuration) as Promise<InferClientRemote<T[K]>>;
		}

		throw `Type '${item.Type}' is not a valid client remote object type`;
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
	public async OnEvent<
		K extends keyof DeclarationsOf<FilterClientDeclarations<T>, ServerToClientEventDeclaration<Array<unknown>>> &
			string,
	>(name: K, fn: InferClientConnect<Extract<T[K], ServerToClientEventDeclaration<Array<unknown>>>>) {
		const result = (await this.WaitFor(name)) as InferClientRemote<ServerToClientEventDeclaration<any>>;
		return result.Connect(fn);
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
	public async OnFunction<
		K extends keyof DeclarationsOf<FilterClientDeclarations<T>, AsyncClientFunctionDeclaration<any, any>> & string,
	>(name: K, fn: InferClientCallback<Extract<T[K], AsyncClientFunctionDeclaration<any, any>>>) {
		const result = (await this.WaitFor(name)) as InferClientRemote<AsyncClientFunctionDeclaration<any, any>>;
		result.SetCallback(fn);
	}
}
