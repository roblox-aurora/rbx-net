namespace NetSerialization {
	/** @internal */
	export interface SerializeOptions {
		serializedId?: string;
		fields: string[];
	}

	/**
	 * Generates all the serialization structures required for Net to serialize this object
	 * @param _options The options for the generator
	 * @decorator
	 * @internal
	 */
	export function Serializable(_options?: NetSerialization.SerializeOptions) {
		return (_object: new (...args: any[]) => any) => {
			throw `Serializable is a decorator function`;
		};
	}

	/**
	 * Declares this class as having a `default` static member that returns a default version of itself.
	 * @param _object
	 * @internal
	 */
	export const Default = (_object: new (...args: any[]) => any) => {
		throw `Serializable is a decorator function`;
	};

	export interface ClassSerializationOptions<TClass extends object, TSerialized extends object> {
		Serialize: (value: PrototypeOf<TClass>) => TSerialized;
		Deserialize: (value: TSerialized) => PrototypeOf<TClass>;
	}

	export interface Serializer<TValue, TSerialized> {
		Serialize(value: TValue): TSerialized;
		Deserialize(value: TSerialized): TValue;
	}

	type NetClassSerializer<TClass extends object, TSerialized extends object> = Serializer<
		PrototypeOf<TClass>,
		SerializedClass<TSerialized>
	>;

	class ClassSerializer<TClass extends object, TSerialized extends object>
		implements NetClassSerializer<TClass, TSerialized> {
		public constructor(
			private typeId: TClass,
			private serialization: ClassSerializationOptions<TClass, TSerialized>,
		) {}

		public Serialize(value: PrototypeOf<TClass>): SerializedClass<TSerialized> {
			return {
				SerializeClassId: tostring(this.typeId),
				SerializeClassValue: this.serialization.Serialize(value),
			};
		}

		public Deserialize(value: SerializedClass<TSerialized>): PrototypeOf<TClass> {
			assert(value.SerializeClassId === tostring(this.typeId), "Attempted to deserialize invalid class");
			return this.serialization.Deserialize(value.SerializeClassValue);
		}
	}

	/**
	 * Creates a class serializer to be used by Net.
	 * This should be called through a ModuleScript so can be accessed by both client and server.
	 * @param typeId The class
	 * @param options The serializer and deserializer options
	 * @returns The class, yo.
	 */
	export function CreateClassSerializer<TClass extends object, TSerialized extends object>(
		typeId: TClass,
		options: ClassSerializationOptions<TClass, TSerialized>,
	): NetClassSerializer<TClass, TSerialized> {
		const serializer = new ClassSerializer(typeId, options);
		return serializer;
	}
}

type PrototypeOf<T> = T extends { prototype: infer P } ? P : never;
type SerializedClass<T> = { SerializeClassId: string; SerializeClassValue: T };

export default NetSerialization;
