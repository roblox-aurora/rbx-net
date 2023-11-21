/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClientRemoteContext } from "../ClientRemoteContext";
import { NamespaceGenerator, NamespaceConfiguration } from "../NamespaceGenerator";
import {
	ServerRemoteContext,
	ServerNetworkModelConfig as ServerNetworkModelConfiguration,
} from "../ServerRemoteContext";
import {
	DeclarationTypeCheck,
	RemoteContexts,
	Identity,
	NamespaceDeclaration,
	RemoteDeclarations,
	Constructor,
	Prototype,
} from "../../Types";
import { ClientBuilder, RemoteBuilder, ServerBuilder } from "./RemoteBuilder";
import { AsyncFunctionBuilder } from "./AsyncFunctionBuilder";
import { EventBuilder } from "./EventBuilder";
import { $package } from "rbxts-transform-debug";
import { isSerializedData } from "../../../internal";

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

export type RemoteBuilders = Record<string, ServerBuilder<any> | ClientBuilder<any>>;
type ReverseMapServer<T extends Record<string, ServerBuilder<any>>> = {
	[P in keyof T]: T[P] extends ServerBuilder<infer S> ? S : never;
};

export interface Serializer<T extends object, S> {
	Serialize(value: T): S;
	Deserialize(value: S): T;
}

export interface UserClassSerializer<TClass extends Constructor, TSerialized extends Record<string, defined>>
	extends Serializer<Prototype<TClass>, TSerialized> {}

export interface ClassSerializer<TConstructor extends Constructor, TSerialized extends Record<string, defined>>
	extends UserClassSerializer<TConstructor, { $classId: string; $data: TSerialized }> {
	readonly $serdeId: string;
	readonly $serdeName: string;
	readonly $serdeType: TConstructor;

	ValidateData(value: unknown): value is TSerialized;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export class DefinitionBuilder<TDeclarations extends RemoteDeclarations = defined> {
	private declarations: TDeclarations = {} as TDeclarations;
	private configuration: ServerNetworkModelConfiguration = {};

	/**
	 * Adds a sub namespace to this NOM
	 * @param namespace The id of the child namespace
	 * @param networkObjectModel The child namespace to add
	 * @param scopeConfiguration Namespace-specific configuration
	 */
	public AddNamespace<TName extends string, TNamespaceDeclarations extends RemoteDeclarations>(
		namespace: Exclude<TName, keyof TDeclarations>,
		networkObjectModel: TNamespaceDeclarations,
		scopeConfiguration?: NamespaceConfiguration,
	): DefinitionBuilder<MergeIdentity<TDeclarations, Named<TName, NamespaceDeclaration<TNamespaceDeclarations>>>>;
	public AddNamespace<TName extends string, TNamespaceDeclarations extends RemoteDeclarations>(
		namespace: Exclude<TName, keyof TDeclarations>,
		networkObjectModel: DefinitionBuilder<TNamespaceDeclarations>,
	): DefinitionBuilder<MergeIdentity<TDeclarations, Named<TName, NamespaceDeclaration<TNamespaceDeclarations>>>>;
	public AddNamespace<TName extends string, TNamespaceDeclarations extends RemoteDeclarations>(
		namespace: string,
		networkObjectModel: TNamespaceDeclarations | DefinitionBuilder<TNamespaceDeclarations>,
		scopeConfiguration?: NamespaceConfiguration,
	) {
		if (networkObjectModel instanceof DefinitionBuilder) {
			networkObjectModel = networkObjectModel.declarations;
		}

		this.declarations = {
			...this.declarations,
			[namespace]: {
				Type: "Namespace",
				Namespace: new NamespaceGenerator(networkObjectModel, { ...this.configuration, ...scopeConfiguration }),
			},
		};

		return this as unknown as DefinitionBuilder<
			MergeIdentity<TDeclarations, Named<TName, NamespaceDeclaration<TNamespaceDeclarations>>>
		>;
	}

	public Add<TAddDeclarations extends RemoteDeclarations>(declarations: TAddDeclarations) {
		this.declarations = {
			...this.declarations,
			...declarations,
		};
		return this as unknown as DefinitionBuilder<MergeIdentity<TDeclarations, TAddDeclarations>>;
	}

	/**
	 * Add a remote that's owned by the server
	 * @param id The id of the remote
	 * @param serverNetworkObject The server owned object to add
	 */
	public AddServerOwned<TName extends string, TServer extends object>(
		id: Exclude<TName, keyof TDeclarations>,
		serverNetworkObject: ServerBuilder<TServer>,
	): DefinitionBuilder<MergeIdentity<Named<TName, TServer>, TDeclarations>> {
		this.declarations = {
			...this.declarations,
			[id]: serverNetworkObject.OnServer(),
		};

		return this as unknown as DefinitionBuilder<MergeIdentity<Named<TName, TServer>, TDeclarations>>;
	}

	// public AddServerOwned2<T extends Record<string, ServerBuilder<any>>>(stuff: T) {
	// 	for (const [k, v] of pairs(stuff) as unknown as IterableFunction<
	// 		LuaTuple<[keyof TDeclarations, ServerBuilder<any>]>
	// 	>) {
	// 		this.declarations[k] = v.OnServer();
	// 	}

	// 	return this as unknown as DefinitionBuilder<MergeIdentity<TDeclarations, ReverseMapServer<T>>>;
	// }

	/**
	 * Enables serialization for this class
	 * @deprecated In development
	 */
	public SerializeClass<TConstructor extends Constructor<any>, TSerializedData extends Record<string, defined>>(
		ctor: TConstructor,
		serialization?: UserClassSerializer<TConstructor, TSerializedData>,
	) {
		if (!serialization) {
			const internalSerializer: ClassSerializer<TConstructor, TSerializedData> = {
				$serdeId: tostring(ctor),
				$serdeName: $package.name,
				$serdeType: ctor,
				Serialize(object) {
					const rawData = setmetatable(table.clone(object), undefined!);

					return {
						$classId: this.$serdeId,
						$data: rawData as TSerializedData,
					};
				},
				Deserialize(object) {
					const construct = this.$serdeType;
					return setmetatable(
						object.$data,
						construct as LuaMetatable<TSerializedData>,
					) as Prototype<TConstructor>;
				},
				ValidateData(value): value is TSerializedData {
					return isSerializedData(value) && value.$classId === this.$serdeId;
				},
			};
		} else {
			// Run the user serializer instead
			const internalSerializer: ClassSerializer<TConstructor, TSerializedData> = {
				$serdeId: tostring(ctor),
				$serdeName: $package.name,
				$serdeType: ctor,
				Serialize(object) {
					return {
						$classId: this.$serdeId,
						$data: serialization.Serialize(object),
					};
				},
				Deserialize(object) {
					assert(object.$classId === this.$serdeId);
					return serialization.Deserialize(object.$data);
				},
				ValidateData(value): value is TSerializedData {
					return isSerializedData(value) && value.$classId === this.$serdeId;
				},
			};
		}

		return this;
	}

	/**
	 * Adds a remote that's owned by the client
	 * @param id The id of the remote
	 * @param clientNetworkObject The client owned object to add
	 * @returns
	 */
	public AddClientOwned<TName extends string, TClient extends object>(
		id: Exclude<TName, keyof TDeclarations>,
		clientNetworkObject: ClientBuilder<TClient>,
	): DefinitionBuilder<MergeIdentity<Named<TName, TClient>, TDeclarations>> {
		this.declarations = {
			...this.declarations,
			[id]: clientNetworkObject.OnClient(),
		};

		return this as unknown as DefinitionBuilder<MergeIdentity<Named<TName, TClient>, TDeclarations>>;
	}

	public Test<K extends keyof TDeclarations>(key: K) {
		return this;
	}

	/**
	 * Set the configuration for this network object model
	 * @param configuration The configuration for this network object model
	 */
	public SetConfiguration(configuration: ServerNetworkModelConfiguration) {
		this.configuration = configuration;
		return this;
	}

	public ToNamespace(): NamespaceDeclaration<TDeclarations> {
		return {
			Type: "Namespace",
			Namespace: new NamespaceGenerator(this.declarations, this.configuration),
		} as NamespaceDeclaration<TDeclarations>;
	}

	/**
	 * Builds this Network Object Model's remotes and sub namespace's models and returns a contextual API
	 * @returns Contexts for this root namespace to access the remotes and child namespaces
	 */
	public Build() {
		validateDeclarations(this.declarations);
		return identity<RemoteContexts<TDeclarations>>({
			Server: new ServerRemoteContext<TDeclarations>(this.declarations, this.configuration),
			Client: new ClientRemoteContext<TDeclarations>(this.declarations, this.configuration),
		});
	}
}
