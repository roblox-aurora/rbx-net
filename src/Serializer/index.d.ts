type FilterFlags<Base, Condition> = {
	[Key in keyof Base]: Base[Key] extends Condition ? Key : never
};

type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];

type SubType<Base, Condition> = Pick<Base, AllowedNames<Base, Condition>>;

type Primitive = number | string | boolean | Instance;

declare namespace Serializer {
	export type Serializable<T> = SubType<T, Primitive | Array<Primitive>>;

	/** 
	 * Serializes an object 
	 */
	function Serialize<T, K extends keyof T>(object: T): Serializable<T>;

	/**
	 * Deserialize using a deserializer function
	 */
	function Deserialize<T>(object: Serializable<T>, deserializer: (value: Serializable<T>) => T): T;

	/**
	 * Deserialize using a static method
	 */
	function Deserialize<T>(object: Serializable<T>, target: { new(...args: any[]): T, deserialize(object: Serializable<T>): T }): T;

	/**
	 * Deserialize by reference
	 */
	function Deserialize<T>(object: Serializable<T>, target: T): void;
}

export as namespace Serializer;
export = Serializer;

/*
{ [P in keyof T]?: T[P] }
*/