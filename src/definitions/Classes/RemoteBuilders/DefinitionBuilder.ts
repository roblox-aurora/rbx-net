import { ClientDefinitions } from "../ClientDefinitions";
import { NamespaceDefinitions, NamespaceConfiguration } from "../NamespaceDefinitions";
import { ServerDefinitions, ServerDefinitionConfig } from "../ServerDefinitions";
import {
	DeclarationTypeCheck,
	GeneratedDefinitions,
	Identity,
	NamespaceDeclaration,
	RemoteDeclarations,
} from "../../Types";
import { RemoteBuilder, Serializable, Serialized } from "./RemoteBuilder";
import { AsyncFunctionBuilder } from "./AsyncFunctionBuilder";

/**
 * Validates the specified declarations to ensure they're valid before usage
 * @param declarations The declarations
 */
function validateDeclarations(declarations: RemoteDeclarations) {
	for (const [, declaration] of pairs(declarations)) {
		assert(DeclarationTypeCheck.check(declaration.Type), DeclarationTypeCheck.errorMessage);
	}
}

type MergeIdentity<T, U> = Identity<T & U>;
type Named<K extends string, T> = { [P in K]: T };

type RemoteBuilderDeclarations = Record<string, RemoteBuilder<any, any>>;

type InferServerDeclarations<T extends RemoteBuilderDeclarations> = {
	[P in keyof T]: T[P] extends RemoteBuilder<infer Server, any> ? Server : never;
};

type InferClientDeclarations<T extends RemoteBuilderDeclarations> = {
	[P in keyof T]: T[P] extends RemoteBuilder<any, infer Client> ? Client : never;
};

type test = InferServerDeclarations<{
	x: AsyncFunctionBuilder;
}>;

export class DefinitionBuilder<TDeclarations extends RemoteDeclarations = {}> {
	private declarations: TDeclarations = {} as TDeclarations;
	private configuration: ServerDefinitionConfig = {};

	public AddNamespace<TName extends string, TNamespaceDeclarations extends RemoteDeclarations>(
		namespace: Exclude<TName, keyof TDeclarations>,
		definitions: TNamespaceDeclarations,
		scopeConfiguration?: NamespaceConfiguration,
	): DefinitionBuilder<MergeIdentity<TDeclarations, Named<TName, NamespaceDeclaration<TNamespaceDeclarations>>>>;

	public AddNamespace<TName extends string, TNamespaceDeclarations extends RemoteDeclarations>(
		namespace: Exclude<TName, keyof TDeclarations>,
		definitions: DefinitionBuilder<TNamespaceDeclarations>,
	): DefinitionBuilder<MergeIdentity<TDeclarations, Named<TName, NamespaceDeclaration<TNamespaceDeclarations>>>>;

	public AddNamespace<TName extends string, TNamespaceDeclarations extends RemoteDeclarations>(
		namespace: Exclude<TName, keyof TDeclarations>,
		builder: (builder: DefinitionBuilder) => DefinitionBuilder<TNamespaceDeclarations>,
	): DefinitionBuilder<MergeIdentity<TDeclarations, Named<TName, NamespaceDeclaration<TNamespaceDeclarations>>>>;

	public AddNamespace<TName extends string, TNamespaceDeclarations extends RemoteDeclarations>(
		namespace: string,
		definitions:
			| TNamespaceDeclarations
			| DefinitionBuilder<TNamespaceDeclarations>
			| ((builder: DefinitionBuilder) => DefinitionBuilder<TNamespaceDeclarations>),
		scopeConfiguration?: NamespaceConfiguration,
	) {
		if (definitions instanceof DefinitionBuilder) {
			definitions = definitions.declarations;
		} else if (typeIs(definitions, "function")) {
			const result = definitions(new DefinitionBuilder());
			definitions = result.declarations;
			scopeConfiguration = result.configuration;
		}

		this.declarations = {
			...this.declarations,
			[namespace]: {
				Type: "Namespace",
				Definitions: new NamespaceDefinitions(definitions, { ...this.configuration, ...scopeConfiguration }),
			},
		};

		return (this as unknown) as DefinitionBuilder<
			MergeIdentity<TDeclarations, Named<TName, NamespaceDeclaration<TNamespaceDeclarations>>>
		>;
	}

	public Add<TAddDeclarations extends RemoteDeclarations>(declarations: TAddDeclarations) {
		this.declarations = {
			...this.declarations,
			...declarations,
		};
		return (this as unknown) as DefinitionBuilder<MergeIdentity<TDeclarations, TAddDeclarations>>;
	}

	public AddServerRemote<TName extends string, TServer extends object>(
		id: Exclude<TName, keyof TDeclarations>,
		remoteDefinition: RemoteBuilder<TServer, any>,
	): DefinitionBuilder<MergeIdentity<Named<TName, TServer>, TDeclarations>> {
		this.declarations = {
			...this.declarations,
			[id]: remoteDefinition.OnServer(),
		};

		return (this as unknown) as DefinitionBuilder<MergeIdentity<Named<TName, TServer>, TDeclarations>>;
	}

	// public AddServer<TAddDeclarations extends RemoteBuilderDeclarations>(value: TAddDeclarations) {
	// 	for (const [k, v] of pairs(value) as IterableFunction<
	// 		LuaTuple<[keyof TAddDeclarations, TAddDeclarations[keyof TAddDeclarations]]>
	// 	>) {
	// 		this.declarations[k as keyof TDeclarations] = v.OnServer();
	// 	}

	// 	return (this as unknown) as DefinitionBuilder<
	// 		MergeIdentity<TDeclarations, InferServerDeclarations<TAddDeclarations>>
	// 	>;
	// }

	// public AddClient<TAddDeclarations extends RemoteBuilderDeclarations>(value: TAddDeclarations) {
	// 	for (const [k, v] of pairs(value) as IterableFunction<
	// 		LuaTuple<[keyof TAddDeclarations, TAddDeclarations[keyof TAddDeclarations]]>
	// 	>) {
	// 		this.declarations[k as keyof TDeclarations] = v.OnClient();
	// 	}

	// 	return (this as unknown) as DefinitionBuilder<
	// 		MergeIdentity<TDeclarations, InferClientDeclarations<TAddDeclarations>>
	// 	>;
	// }

	public AddClientRemote<TName extends string, TClient extends object>(
		id: Exclude<TName, keyof TDeclarations>,
		remoteDefinition: RemoteBuilder<any, TClient>,
	): DefinitionBuilder<MergeIdentity<Named<TName, TClient>, TDeclarations>> {
		this.declarations = {
			...this.declarations,
			[id]: remoteDefinition.OnClient(),
		};

		return (this as unknown) as DefinitionBuilder<MergeIdentity<Named<TName, TClient>, TDeclarations>>;
	}

	public SetConfiguration(configuration: ServerDefinitionConfig) {
		this.configuration = configuration;
		return this;
	}

	public ToNamespace(): NamespaceDeclaration<TDeclarations> {
		return {
			Type: "Namespace",
			Definitions: new NamespaceDefinitions(this.declarations, this.configuration),
		} as NamespaceDeclaration<TDeclarations>;
	}

	public Build() {
		validateDeclarations(this.declarations);
		return identity<GeneratedDefinitions<TDeclarations>>({
			Server: new ServerDefinitions<TDeclarations>(this.declarations, this.configuration),
			Client: new ClientDefinitions<TDeclarations>(this.declarations, this.configuration),
		});
	}
}
