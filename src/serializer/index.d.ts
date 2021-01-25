type ExcludeUnserializable<T> = { [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K }[keyof T];
export type Serialized<T> = T extends number
	? number
	: T extends string
	? string
	: T extends boolean
	? boolean
	: T extends Array<any>
	? T
	: T extends Serializable<infer R>
	? R
	: Pick<T, ExcludeUnserializable<T>>;

export type Deserializer<TInput, TOutput> = { deserialize(input: TInput): TOutput };

type ValidNetworkValue =
	| string
	| number
	| boolean
	| Instance
	| CFrame
	| Vector3
	| Vector2
	| Region3
	| Color3
	| NumberSequence
	| ColorSequence
	| UDim
	| UDim2
	| NumberRange
	| Rect
	| BrickColor
	| ValidNetworkValue[]
	| Map<string, ValidNetworkValue>
	| { [name: string]: ValidNetworkValue };
type GetSerializedValue<T> = T extends Serialized<infer A> ? A : T;
type test = Serialized<{ x: number; fun: () => void }>;

export function Serialize<T>(value: T): Serialized<T>;
export function Deserialize<TSerialized, TDeseralized>(
	value: GetSerializedValue<TSerialized>,
	deserializer: Deserializer<GetSerializedValue<TSerialized>, TDeseralized>,
): TDeseralized;
export function IsSerializable(value: unknown): value is ValidNetworkValue;

type OnlySerializable<T> = T extends { [K in keyof T]: Serialized<T> } ? T : never;

/**
 * Makes a class serializable
 */
export interface Serializable<T> {
	Serialize(): Serialized<T> & Record<string, ValidNetworkValue>;
}

// export interface Serializable<T> {
// 	Serialize(): Serialized<T>;
// }

export as namespace Serialization;
