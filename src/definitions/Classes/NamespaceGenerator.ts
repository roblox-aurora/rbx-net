import { $dbg, $print } from "rbxts-transform-debug";
import { DefinitionConfiguration } from "..";
import { NetGlobalMiddleware } from "../../middleware";
import { ClientRemoteContext } from "./ClientRemoteContext";
import { ServerRemoteContext } from "./ServerRemoteContext";
import { NamespaceDeclaration, RemoteDeclarations } from "../Types";
const RunService = game.GetService("RunService");

// Isolate the definitions since we don't need to access them anywhere else.
const declarationMap = new WeakMap<NamespaceGenerator<RemoteDeclarations>, RemoteDeclarations>();

export type ToServerBuilder<T> = T extends NamespaceGenerator<infer A> ? ServerRemoteContext<A> : never;
export type ToClientBuilder<T> = T extends NamespaceGenerator<infer A> ? ClientRemoteContext<A> : never;
export type InferDefinition<T> = T extends NamespaceDeclaration<infer R> ? R : {};

export interface NamespaceConfiguration
	extends Omit<DefinitionConfiguration, "ServerGlobalMiddleware" | "ClientGetShouldYield"> {}

/**
 * A namespace builder. Internally used to construct definition builders
 */
export class NamespaceGenerator<N extends RemoteDeclarations> {
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
	public _GenerateServerContext(configuration: NamespaceConfiguration, namespace?: string): ServerRemoteContext<N> {
		assert(RunService.IsServer());
		$print("Building server definition", declarationMap.get(this)!);
		return new ServerRemoteContext<N>(declarationMap.get(this) as N, configuration, namespace);
	}

	/** @internal */
	public _GenerateClientContext(configuration: NamespaceConfiguration, namespace?: string): ClientRemoteContext<N> {
		assert(RunService.IsClient());
		$print("Building client definition", declarationMap.get(this)!);
		return new ClientRemoteContext<N>(declarationMap.get(this) as N, configuration, namespace);
	}
}
