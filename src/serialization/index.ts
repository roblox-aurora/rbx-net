namespace NetSerialization {
	export interface Serialized<T> {
		Class: string;
		Value: T;
	}

	export interface SerializeOptions {
		serializedId?: string;
		fields: string[];
	}

	/**
	 * Generates all the serialization structures required for Net to serialize this object
	 * @param _options The options for the generator
	 * @decorator
	 */
	export function Serializable(_options?: NetSerialization.SerializeOptions) {
		return (_object: new (...args: any[]) => any) => {
			throw `Serializable is a decorator function`;
		};
	}

	/**
	 * Declares this class as having a `default` static member that returns a default version of itself.
	 * @param _object
	 */
	export const Default = (_object: new (...args: any[]) => any) => {
		throw `Serializable is a decorator function`;
	};

	export interface Serializable<T> {
		Serialize(): T;
	}

	export interface SerializableClass<T extends Serializable<any>, U> {
		new (...args: any[]): T & Serializable<U>;
		deserialize?(value: U): T;
	}

	const dud = 1;

	function hasKey<K extends string>(value: defined): value is { Serialize: defined } {
		return "Serialize" in value;
	}

	function hasSerializer(value: defined): value is { Serialize(): defined } {
		return hasKey(value) && typeIs(value.Serialize, "function");
	}

	export function Serialize(value: object) {}
	export function Deserialize() {}

	const serializers = new Map<string, SerializableClass<any, any>>();
	const serializationFunctions = new Map<defined, (value: any) => defined>();

	export function AddSerializableClass<T extends Serializable<any>, U>(
		serializeId: string,
		serializer: SerializableClass<T, U>,
	) {
		serializers.set(serializeId, serializer);
	}

	export function AddSerializer<T extends object, R extends Record<string, unknown>>(
		serializationKey: string,
		object: T,
		value: (value: PrototypeOf<T>) => R,
	) {
		serializationFunctions.set(object, value);
		return value;
	}

	export function AddDeserializer<T extends object>(
		serializationKey: string,
		object: T,
		value: (value: Record<string, unknown>) => PrototypeOf<T>,
	) {}
}

type PrototypeOf<T> = T extends { prototype: infer P } ? P : T;

export default NetSerialization;
