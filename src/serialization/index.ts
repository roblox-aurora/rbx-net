namespace NetSerialization {
	export interface Serialized<T> {
		Value: T;
	}

	export interface SerializeOptions {
		serializedId?: string;
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
		// serialize?(value: T): Serialized<U>;
		serializedId: string;
	}

	const dud = 1;

	export function Serialize() {}
	export function Deserialize() {}

	const serializers = new Map<string, SerializableClass<any, any>>();
	export function AddSerializableClass<T extends Serializable<any>, U>(serializer: SerializableClass<T, U>) {
		serializers.set(serializer.serializedId, serializer);
	}
}
export default NetSerialization;
