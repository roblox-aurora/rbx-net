import {
	AsyncFunctionDeclarationLike,
	ClientBuildResult,
	EventDeclarationLike,
	FunctionDeclarationLike,
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
export type DeclarationType<T extends DefinitionsCreateResult<any>> = T extends DefinitionsCreateResult<infer D>
	? D
	: never;

/**
 * @internal Only accessible as an object internally.
 */
export class _NetDefinitionBuilders<T extends RemoteDeclarations> implements DefinitionsCreateResult<T> {
	/**
	 * Server builder namespace
	 */
	public readonly Server = new ServerDefinitionBuilder<T>(this.declarations);

	/**
	 * Client builder namespace
	 */
	public readonly Client = new ClientDefinitionBuilder<T>(this.declarations);

	public constructor(private declarations: T) {}
}

/**
 * The DefinitionBuilders type
 */
export interface DefinitionsCreateResult<T extends RemoteDeclarations> {
	readonly Server: ServerDefinitionBuilder<T>;
	readonly Client: ClientDefinitionBuilder<T>;
}
