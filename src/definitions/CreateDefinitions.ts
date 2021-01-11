import ServerAsyncFunction from "../server/ServerAsyncFunction";
import ClientAsyncFunction from "../client/ClientAsyncFunction";
import ClientEvent from "../client/ClientEvent";
import ServerEvent from "../server/ServerEvent";
import ClientFunction from "../client/ClientFunction";
import ServerFunction from "../server/ServerFunction";
import {
	AsyncFunctionDeclarationLike,
	ClientBuildResult,
	EventDeclaration,
	EventDeclarationLike,
	FunctionDeclarationLike,
	InferClientRemote,
	InferServerRemote,
	RemoteDeclarations,
	ServerBuildResult,
} from "./Types";
import { ClientDefinitionBuilder } from "./ClientDefinitionBuilder";
import { ServerDefinitionBuilder } from "./ServerDefinitionBuilder";

export type DeclarationsOf<
	T extends RemoteDeclarations,
	U extends EventDeclarationLike | FunctionDeclarationLike | AsyncFunctionDeclarationLike
> = {
	[K in ExtractKeys<T, U>]: T[K];
};
export type DeclarationType<T extends DefinitionBuilders<any>> = T extends DefinitionBuilders<infer D> ? D : never;

class DefinitionBuilders<T extends RemoteDeclarations> implements DefinitionBuilders<T> {
	/**
	 * Server builder namespace
	 */
	public readonly Server = new ServerDefinitionBuilder<T>(this.decl);

	/**
	 * Client builder namespace
	 */
	public readonly Client = new ClientDefinitionBuilder<T>(this.decl);

	public constructor(private decl: T) {}

	/** @deprecated */
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
	 * @deprecated Use `.Client.Get(name)` - This will be removed in the future
	 */
	GetClient<K extends keyof T & string>(k: K): InferClientRemote<T[K]> {
		warn("[rbx-net] Use 'Client.Get' instead of 'GetClient' in the DefinitionBuilder for " + k + "");
		return this.Client.Get(k);
	}

	/**
	 * Creates a server remote from a declaration
	 * @deprecated Use `.Server.Create(name)` - This will be removed in the future
	 */
	CreateServer<K extends keyof T & string>(k: K): InferServerRemote<T[K]> {
		warn("[rbx-net] Use 'Server.Create' instead of 'CreateServer' in the DefinitionBuilder for " + k + ".");
		return this.Server.Create(k);
	}

	/** @deprecated */
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

interface DefinitionBuilders<T extends RemoteDeclarations> {
	readonly Server: ServerDefinitionBuilder<T>;
	readonly Client: ClientDefinitionBuilder<T>;
}

export default function CreateNetDefinitionBuilder<T extends RemoteDeclarations>(remotes: T) {
	return new DefinitionBuilders<T>(remotes);
}
