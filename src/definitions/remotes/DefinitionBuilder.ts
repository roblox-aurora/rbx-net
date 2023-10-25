import { ClientDefinitionBuilder } from "../ClientDefinitionBuilder";
import { NamespaceBuilder, NamespaceConfiguration } from "../NamespaceBuilder";
import { ServerDefinitionBuilder, ServerDefinitionConfig } from "../ServerDefinitionBuilder";
import { DeclarationTypeCheck, DefinitionsCreateResult, NamespaceDeclaration, RemoteDeclarations } from "../Types";
import { RemoteBuilder } from "./RemoteBuilder";

/**
 * Validates the specified declarations to ensure they're valid before usage
 * @param declarations The declarations
 */
function validateDeclarations(declarations: RemoteDeclarations) {
	for (const [, declaration] of pairs(declarations)) {
		assert(DeclarationTypeCheck.check(declaration.Type), DeclarationTypeCheck.errorMessage);
	}
}

export class DefinitionBuilder<TDeclarations extends RemoteDeclarations = {}> {
	private declarations: TDeclarations = {} as TDeclarations;
	private configuration: ServerDefinitionConfig = {};

	public AddNamespace<TName extends string, TDecl extends RemoteDeclarations>(
		namespace: Exclude<TName, keyof TDeclarations>,
		definitions: TDecl,
		scopeConfiguration?: NamespaceConfiguration,
	): DefinitionBuilder<TDeclarations & { [P in TName]: NamespaceDeclaration<TDecl> }>;
	public AddNamespace<TName extends string, TDecl extends RemoteDeclarations>(
		namespace: Exclude<TName, keyof TDeclarations>,
		definitions: DefinitionBuilder<TDecl>,
	): DefinitionBuilder<TDeclarations & { [P in TName]: NamespaceDeclaration<TDecl> }>;
	public AddNamespace<TName extends string, TDecl extends RemoteDeclarations>(
		namespace: Exclude<TName, keyof TDeclarations>,
		builder: (builder: DefinitionBuilder) => DefinitionBuilder<TDecl>,
	): DefinitionBuilder<TDeclarations & { [P in TName]: NamespaceDeclaration<TDecl> }>;

	public AddNamespace<TName extends string, TDecl extends RemoteDeclarations>(
		namespace: string,
		definitions: TDecl | DefinitionBuilder<TDecl> | ((builder: DefinitionBuilder) => DefinitionBuilder<TDecl>),
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
				Definitions: new NamespaceBuilder(definitions, { ...this.configuration, ...scopeConfiguration }),
			},
		};

		return (this as unknown) as DefinitionBuilder<TDeclarations & { [P in TName]: NamespaceDeclaration<TDecl> }>;
	}

	public Add<TAddDeclarations extends RemoteDeclarations>(declarations: TAddDeclarations) {
		this.declarations = {
			...this.declarations,
			...declarations,
		};
		return (this as unknown) as DefinitionBuilder<TDeclarations & TAddDeclarations>;
	}

	public AddServerRemote<TName extends string, TServer extends object>(
		id: Exclude<TName, keyof TDeclarations>,
		remoteDefinition: RemoteBuilder<TServer, any>,
	): DefinitionBuilder<TDeclarations & { [P in TName]: TServer }> {
		this.declarations = {
			...this.declarations,
			[id]: remoteDefinition.OnServer(),
		};

		return (this as unknown) as DefinitionBuilder<TDeclarations & { [P in TName]: TServer }>;
	}

	public AddClientRemote<TName extends string, TClient extends object>(
		id: Exclude<TName, keyof TDeclarations>,
		remoteDefinition: RemoteBuilder<any, TClient>,
	): DefinitionBuilder<TDeclarations & { [P in TName]: TClient }> {
		this.declarations = {
			...this.declarations,
			[id]: remoteDefinition.OnClient(),
		};

		return (this as unknown) as DefinitionBuilder<TDeclarations & { [P in TName]: TClient }>;
	}

	public SetConfiguration(configuration: ServerDefinitionConfig) {
		this.configuration = configuration;
		return this;
	}

	public ToNamespace(): NamespaceDeclaration<TDeclarations> {
		return {
			Type: "Namespace",
			Definitions: new NamespaceBuilder(this.declarations, this.configuration),
		} as NamespaceDeclaration<TDeclarations>;
	}

	public Build() {
		validateDeclarations(this.declarations);
		return identity<DefinitionsCreateResult<TDeclarations>>({
			Server: new ServerDefinitionBuilder<TDeclarations>(this.declarations, this.configuration),
			Client: new ClientDefinitionBuilder<TDeclarations>(this.declarations, this.configuration),
		});
	}
}
