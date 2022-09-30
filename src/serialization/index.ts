const serializerMap = new WeakMap<object, SerializerMethods>();

export interface SerializerMethods<TObject extends object = object, TSerialized extends object = object> {
	Serialize(value: TObject): TSerialized;
	Deserialize(value: TSerialized): TObject;
}

interface NetSerializerDTO<T extends object> {
	readonly __NetType: string;
	readonly __Serialized: T;
}

export type GenericSerializer = ClassSerializer<object, object>;

export abstract class ClassSerializer<
	TClass extends object,
	TSerialized extends object = object,
	TDeserialized extends object = TClass
> implements SerializerMethods<TDeserialized, NetSerializerDTO<TSerialized>> {
	readonly __NetType: string;

	public constructor(public readonly Constructor: TClass) {
		this.__NetType = tostring(this.Constructor);
	}

	/**
	 * @internal
	 */
	abstract Serialize(value: TDeserialized): NetSerializerDTO<TSerialized>;

	/**
	 * @internal
	 */
	abstract Deserialize(value: NetSerializerDTO<TSerialized>): TDeserialized;
}

export interface Serializer<T> {
	Serialize(): T;
}

export interface Constructor<TClass extends object> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	new (...args: any[]): TClass;
}

export interface Serializable<TClass extends Serializer<TSerialize>, TSerialize> extends Constructor<TClass> {
	Deserialize(value: TSerialize): TClass;
}

export namespace NetSerializer {
	/**
	 * @internal
	 */
	export function IsNetworkWrapped(value: unknown): value is NetSerializerDTO<object> {
		return typeIs(value, "table") && "NetType" in value;
	}

	// export type InferDeserializerType<TClass> = TClass extends { Deserialize(input: unknown): infer A } ? A : never;
	// export type InferSerializerType<TClass> = TClass extends { new (...args: unknown[]): { Serialize(): infer A } }
	// 	? A
	// 	: never;

	/**
	 * Creates a custom serializer
	 *
	 * Used in the case you're overloading a library-based class rather than your own, and can't add extra methods
	 * @param constructor The class to create the serializer against
	 * @param custom The custom serialization handler
	 * @returns A serializer
	 */
	export function CustomClass<TClass extends object, TSerialize extends object, TDeserialize extends object>(
		constructor: TClass,
		custom: SerializerMethods<TDeserialize, TSerialize>,
	) {
		return new (class CustomSerializer extends ClassSerializer<TClass, TSerialize, TDeserialize> {
			Deserialize(serialized: NetSerializerDTO<TSerialize>): TDeserialize {
				assert(serialized.__NetType === this.__NetType, "mismatched network type");
				return custom.Deserialize(serialized.__Serialized);
			}

			Serialize(value: TDeserialize): NetSerializerDTO<TSerialize> {
				return {
					__NetType: this.__NetType,
					__Serialized: custom.Serialize(value),
				};
			}

			constructor() {
				super(constructor);
			}
		})();
	}

	/**
	 * Creates a serializer based off a user serializable class
	 *
	 * Class must contain:
	 * - A `static Deserialize` method
	 * - A `Serialize` method
	 * @param serializable The serializable class
	 * @returns The serializer
	 */
	export function Class<TClass extends { Serialize(): TSerialize }, TSerialize extends object>(
		serializable: Serializable<TClass, TSerialize>,
	) {
		return new (class ManagedSerializer extends ClassSerializer<
			Serializable<TClass, TSerialize>,
			TSerialize,
			TClass
		> {
			Deserialize(serialized: NetSerializerDTO<TSerialize>): TClass {
				assert(serialized.__NetType === this.__NetType, "mismatched network type");
				return serializable.Deserialize(serialized.__Serialized);
			}

			Serialize(value: TClass): NetSerializerDTO<TSerialize> {
				return {
					__NetType: this.__NetType,
					__Serialized: value.Serialize(),
				};
			}

			constructor() {
				super(serializable);
			}
		})();
	}
}
