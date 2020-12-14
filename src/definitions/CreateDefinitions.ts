import ServerAsyncFunction from "../server/ServerAsyncFunction";
import ClientAsyncFunction from "../client/ClientAsyncFunction";
import ClientEvent from "../client/ClientEvent";
import ServerEvent from "../server/ServerEvent";
import ClientFunction from "../client/ClientFunction";
import ServerFunction from "../server/ServerFunction";
import {
	AsyncFunctionDeclarationLike,
	ClientBuildResult,
	EventDeclarationLike,
	FunctionDeclarationLike,
	InferClientRemote,
	InferServerRemote,
	RemoteDeclarations,
	ServerBuildResult,
} from "./Types";

class DefinitionBuilder<T extends RemoteDeclarations> {
	public constructor(private decl: T) {}
	GetAllClient() {
		const remotes = {} as Record<
			string,
			ClientAsyncFunction<any, any> | ClientFunction<any> | ClientEvent<any, any>
		>;
		for (const [remoteId] of pairs(this.decl as Record<string, FunctionDeclarationLike>)) {
			remotes[remoteId] = this.GetClient(remoteId);
		}

		return remotes as ClientBuildResult<T>;
	}

	/**
	 * Gets a client remote from a declaration
	 */
	GetClient<K extends keyof T & string>(k: K): InferClientRemote<T[K]> {
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
	 * Creates a server remote from a declaration
	 */
	CreateServer<K extends keyof T & string>(k: K): InferServerRemote<T[K]> {
		const item = this.decl[k] as FunctionDeclarationLike | AsyncFunctionDeclarationLike | EventDeclarationLike;
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
	CreateAllServer() {
		const remotes = {} as Record<
			string,
			ServerAsyncFunction<any, any> | ServerFunction<any> | ServerEvent<any, any>
		>;
		for (const [remoteId] of pairs(this.decl as Record<string, FunctionDeclarationLike>)) {
			remotes[remoteId] = this.CreateServer(remoteId);
		}

		return remotes as ServerBuildResult<T>;
	}
}

export default function CreateNetDefinitionBuilder<T extends RemoteDeclarations>(remotes: T) {
	return new DefinitionBuilder<T>(remotes);
}
