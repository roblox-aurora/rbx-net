import { $dbg, $print } from "rbxts-transform-debug";
import { DefinitionConfiguration } from "..";
import { NetGlobalMiddleware } from "../../middleware";
import { ClientDefinitions } from "./ClientDefinitions";
import { ServerDefinitions } from "./ServerDefinitions";
import { NamespaceDeclaration, RemoteDeclarations } from "../Types";
const RunService = game.GetService("RunService");

// Isolate the definitions since we don't need to access them anywhere else.
const declarationMap = new WeakMap<NamespaceDefinitions<RemoteDeclarations>, RemoteDeclarations>();

export type ToServerBuilder<T> = T extends NamespaceDefinitions<infer A> ? ServerDefinitions<A> : never;
export type ToClientBuilder<T> = T extends NamespaceDefinitions<infer A> ? ClientDefinitions<A> : never;
export type InferDefinition<T> = T extends NamespaceDeclaration<infer R> ? R : {};

export interface NamespaceConfiguration
	extends Omit<DefinitionConfiguration, "ServerGlobalMiddleware" | "ClientGetShouldYield"> {}

/**
 * A namespace builder. Internally used to construct definition builders
 */
export class NamespaceDefinitions<N extends RemoteDeclarations> {
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
	_BuildServerDefinition(configuration: NamespaceConfiguration, namespace?: string): ServerDefinitions<N> {
		assert(RunService.IsServer());
		$print("Building server definition", declarationMap.get(this)!);
		return new ServerDefinitions<N>(declarationMap.get(this) as N, configuration, namespace);
	}

	/** @internal */
	_BuildClientDefinition(configuration: NamespaceConfiguration, namespace?: string): ClientDefinitions<N> {
		assert(RunService.IsClient());
		$print("Building client definition", declarationMap.get(this)!);
		return new ClientDefinitions<N>(declarationMap.get(this) as N, configuration, namespace);
	}
}
