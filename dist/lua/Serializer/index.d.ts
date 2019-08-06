type FilterFlags<Base, Condition> = { [Key in keyof Base]: Base[Key] extends Condition ? Key : never };

type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];

type SubType<Base, Condition> = Pick<Base, AllowedNames<Base, Condition>>;

type Primitive = number | string | boolean | Instance;

declare class Deserializable<T> {
	public static deserialize<T>(serialized: Serializer.Serializable<T>): T;
}

interface DeserializeWrapper<T, U extends unknown[]> {
	new (...param: U): T;
	deserialize(serialized: Serializer.Serializable<T>): T;
}

declare namespace Serializer {
	type Serializable<T> = { [P in FilterFlags<T, string | number | boolean | Instance | Primitive[]>[keyof T]]: T[P] };

	type ISerializable<T> = { serialize(): Serializable<T>; deserialize(serialized: Serializable<T>): void };

	/**
	 * Serializes an object
	 */
	function Serialize<T>(object: T): Serializable<T>;

	/**
	 * Deserialize using a deserializer function
	 */
	function Deserialize<T>(object: Serializable<T>, deserializer: (value: Serializable<T>) => T): T;

	/**
	 * Deserialize using a static method
	 */
	function Deserialize<T>(
		object: Serializable<T>,
		target: { new (...args: any[]): T; deserialize(object: Serializable<T>): T },
	): T;

	/**
	 * Deserialize by reference
	 */
	function Deserialize<T>(object: Serializable<T>, target: T): void;

	/**
	 * Get whether or not the specified value can be sent over the network
	 */
	function IsSerializable(value: unknown): boolean;

	// /**
	//  * Create an object with a deserialize static method
	//  * @param classObject The class to deserialize
	//  * @param deserializer The deserializer function
	//  */
	// function makeDeserializable<T, U extends any[]>(classObject: { new(...args: U): T }, deserializer: (serialized: Serializable<T>) => T): {
	// 	new(...param: U): T,
	// 	deserialize(serialized: Serializable<T>): T;
	// }

	// /**
	//  * Create an object with a deserialize static method
	//  * @param classObject The class to deserialize
	//  * @param constructorArg The default constructor arguments
	//  */
	// function makeDeserializable<T, U extends any[]>(classObject: { new(...args: U): T }, ...constructorArg: U): DeserializeWrapper<T, U>;
}

export as namespace Serializer;
export = Serializer;

/*
{ [P in keyof T]?: T[P] }
*/
