import { $print } from "rbxts-transform-debug";
import { DefinitionConfiguration } from ".";
import { ClientDefinitionBuilder } from "./ClientDefinitionBuilder";
import { ServerDefinitionBuilder } from "./ServerDefinitionBuilder";
import { NamespaceDeclaration, RemoteDeclarations } from "./Types";
const RunService = game.GetService("RunService");

// Isolate the definitions since we don't need to access them anywhere else.
const declarationMap = new WeakMap<NamespaceBuilder<RemoteDeclarations>, RemoteDeclarations>();

export type ToServerBuilder<T> = T extends NamespaceBuilder<infer A> ? ServerDefinitionBuilder<A> : never;
export type ToClientBuilder<T> = T extends NamespaceBuilder<infer A> ? ClientDefinitionBuilder<A> : never;
export type InferDefinition<T> = T extends NamespaceDeclaration<infer R> ? R : never;

export interface NamespaceConfiguration
	extends Omit<DefinitionConfiguration, "ServerGlobalMiddleware" | "ClientGetShouldYield"> {}

/**
 * A namespace builder. Internally used to construct definition builders
 */
export class NamespaceBuilder<N extends RemoteDeclarations> {
	public constructor(declarations: N, private config?: NamespaceConfiguration) {
		declarationMap.set(this, declarations);
	}

	/** @internal */
	public _CombineConfigurations(parentConfig: DefinitionConfiguration): NamespaceConfiguration {
		const newConfig = {
			...parentConfig,
			...this.config,
		};

		return newConfig;
	}

	/** @internal */
	_BuildServerDefinition(configuration: NamespaceConfiguration, namespace?: string): ServerDefinitionBuilder<N> {
		assert(RunService.IsServer(), "Attempted to index server remotes from client");
		$print("Building server definition", declarationMap.get(this)!);
		return new ServerDefinitionBuilder<N>(declarationMap.get(this) as N, configuration, namespace);
	}

	/** @internal */
	_BuildClientDefinition(configuration: NamespaceConfiguration, namespace?: string): ClientDefinitionBuilder<N> {
		assert(RunService.IsClient(), "Attempted to index client remotes from server");
		$print("Building client definition", declarationMap.get(this)!);
		return new ClientDefinitionBuilder<N>(declarationMap.get(this) as N, configuration, namespace);
	}
}
