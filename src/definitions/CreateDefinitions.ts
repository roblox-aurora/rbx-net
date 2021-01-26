import type { DefinitionsCreateResult, RemoteDeclarations } from "./Types";
import { ClientDefinitionBuilder } from "./ClientDefinitionBuilder";
import { ServerDefinitionBuilder } from "./ServerDefinitionBuilder";

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
