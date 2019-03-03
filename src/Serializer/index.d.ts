type FilterFlags<Base, Condition> = {
	[Key in keyof Base]: Base[Key] extends Condition ? Key : never
};

type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];

type SubType<Base, Condition> = Pick<Base, AllowedNames<Base, Condition>>;

type Primitive = number | string | boolean | Instance;

declare namespace Serializer {
	export type Serializable<T> = SubType<T, Primitive | Array<Primitive>>;

	function serialize<T, K extends keyof T>(object: T): Serializable<T>;

	function deserialize<T>(object: Serializable<T>, target: T): T;
	function deserialize<T>(object: Serializable<T>, deserializer: (value: Serializable<T>) => T): T;
}

export as namespace Serializer;
export = Serializer;

/*
{ [P in keyof T]?: T[P] }
*/