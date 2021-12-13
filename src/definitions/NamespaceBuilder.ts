import { $dbg, $print } from "rbxts-transform-debug";
import { DefinitionConfiguration } from ".";
import { NetGlobalMiddleware } from "../middleware";
import { ClientDefinitionBuilder } from "./ClientDefinitionBuilder";
import { ServerDefinitionBuilder } from "./ServerDefinitionBuilder";
import { NamespaceDeclaration, RemoteDeclarations } from "./Types";
const RunService = game.GetService("RunService");

// Isolate the definitions since we don't need to access them anywhere else.
const declarationMap = new WeakMap<NamespaceBuilder<RemoteDeclarations>, RemoteDeclarations>();

export type ToServerBuilder<T> = T extends NamespaceBuilder<infer A> ? ServerDefinitionBuilder<A> : never;
export type ToClientBuilder<T> = T extends NamespaceBuilder<infer A> ? ClientDefinitionBuilder<A> : never;
export type InferDefinition<T> = T extends NamespaceDeclaration<infer R> ? R : never;

export interface NamespaceConfiguration extends Omit<DefinitionConfiguration, "ServerGlobalMiddleware"> {}

/**
 * A namespace builder. Internally used to construct definition builders
 */
export class NamespaceBuilder<N extends RemoteDeclarations> {
	public constructor(declarations: N, private config?: NamespaceConfiguration) {
		declarationMap.set(this, declarations);
		$dbg(declarations, (value, source) => {
			print(`[${source.file}:${source.lineNumber}]`, "== Namespace Declarations ==");
			for (const [name, va] of pairs(value)) {
				print(`[${source.file}:${source.lineNumber}]`, name, va.Type);
			}
		});
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
		assert(RunService.IsServer());
		$print("Building server definition", declarationMap.get(this)!);
		return new ServerDefinitionBuilder<N>(declarationMap.get(this) as N, configuration);
	}

	/** @internal */
	_BuildClientDefinition(namespace?: string): ClientDefinitionBuilder<N> {
		assert(RunService.IsClient());
		$print("Building client definition", declarationMap.get(this)!);
		return new ClientDefinitionBuilder<N>(declarationMap.get(this) as N, namespace);
	}
}
