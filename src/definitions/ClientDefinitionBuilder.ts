import ClientAsyncFunction from "../client/ClientAsyncFunction";
import ClientEvent from "../client/ClientEvent";
import ClientFunction from "../client/ClientFunction";
import {
	AsyncFunctionDeclarationLike,
	EventDeclarationLike,
	FunctionDeclarationLike,
	InferClientConnect,
	InferClientRemote,
	RemoteDeclarations,
} from "./Types";
import { DeclarationsOf } from "./CreateDefinitions";

export class ClientDefinitionBuilder<T extends RemoteDeclarations> {
	public constructor(private decl: T) {}
	/**
	 * Gets a client remote from a declaration
	 */
	Get<K extends keyof T & string>(k: K): InferClientRemote<T[K]> {
		const item = this.decl[k] as FunctionDeclarationLike | AsyncFunctionDeclarationLike | EventDeclarationLike;
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
	 * Create a receive-only event for the client.
	 *
	 * @param name The name
	 * @param fn The callback
	 *
	 * Shortcut for:
	 * ```ts
	 * Declaration.GetClient(name).Connect(fn)
	 * ```
	 */
	ConnectEvent<K extends keyof DeclarationsOf<T, EventDeclarationLike> & string>(
		name: K,
		fn: InferClientConnect<Extract<T[K], EventDeclarationLike>>,
	) {
		const result = this.Get(name) as InferClientRemote<EventDeclarationLike>;
		result.Connect(fn);
	}
}
