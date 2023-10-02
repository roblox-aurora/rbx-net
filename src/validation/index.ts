import utf8_validator from "./utf8_validator";

export namespace types {
	export type check<T> = (value: unknown) => value is T;
	export type value<T extends check<any>> = T extends check<infer A> ? A : never;

	export type CheckArrayToValueArray<T extends ReadonlyArray<check<any>>> = { [P in keyof T]: value<T[P]> };
	export type ValueArrayToCheckArray<T extends ReadonlyArray<any>> = { [P in keyof T]: check<T[P]> };

	export type InvokerFromValidatorsArray<T extends ReadonlyArray<types.check<unknown>>> = (
		...args: { [P in keyof T]: value<T[P]> }
	) => void;

	export const number: check<number> = (value): value is number => {
		// number check
		if (!typeIs(value, "number")) {
			return false;
		}

		// NaN check
		if (value !== value) {
			return false;
		}

		return true;
	};

	/**
	 * Returns whether or not the value is a valid UTF-8 string
	 * @param value The value
	 * @returns True if this is a valid UTF8 string
	 */
	export const String: check<string> = (value): value is string => typeIs(value, "string") && utf8_validator(value);

	export const boolean: check<boolean> = (value): value is boolean => typeIs(value, "boolean");

	export const optional = <T>(validator: check<T>): check<T | undefined> => {
		return (value): value is T | undefined => {
			if (value === undefined) return true;
			return validator(value);
		};
	};

	export const Vector3: check<Vector3> = (value): value is Vector3 => typeIs(value, "vector");
	export const Vector2: check<Vector2> = (value): value is Vector2 => typeIs(value, "Vector2");
	export const Color3: check<Color3> = (value): value is Color3 => typeIs(value, "Color3");
	export const Font: check<Font> = (value): value is Font => typeIs(value, "Font");
	export const Vector3int16: check<Vector3int16> = (value): value is Vector3int16 => typeIs(value, "Vector3int16");
	export const Vector2int16: check<Vector2int16> = (value): value is Vector2int16 => typeIs(value, "Vector2int16");
	export const NumberSequence: check<NumberSequence> = (value): value is NumberSequence =>
		typeIs(value, "NumberSequence");
	export const ColorSequence: check<ColorSequence> = (value): value is ColorSequence =>
		typeIs(value, "ColorSequence");
	export const DateTime: check<DateTime> = (value): value is DateTime => typeIs(value, "DateTime");
	export const Ray: check<Ray> = (value): value is Ray => typeIs(value, "Ray");
	export const NumberRange: check<NumberRange> = (value): value is NumberRange => typeIs(value, "NumberRange");
	export const CFrame: check<CFrame> = (value): value is CFrame => typeIs(value, "CFrame");

	type isNumeric = check<number>;

	export const integer: isNumeric = (value): value is number => number(value) && value % 1 === 0;

	export const u8: isNumeric = (value): value is number => integer(value) && value >= 0 && value <= 255;
	export const u16: isNumeric = (value): value is number => integer(value) && value >= 0 && value <= 65_535;
	export const u32: isNumeric = (value): value is number => integer(value) && value >= 0 && value <= 4_294_967_295;

	export const i8: isNumeric = (value): value is number => integer(value) && value >= -128 && value <= 127;
	export const i16: isNumeric = (value): value is number => integer(value) && value >= -32_768 && value <= 32_767;
	export const i32: isNumeric = (value): value is number =>
		integer(value) && value >= -2_147_483_648 && value <= 2_147_483_647;

	export function floatRange(rStart: number, rEnd: number) {
		return (value: unknown): value is number => {
			return number(value) && value >= rStart && value <= rEnd;
		};
	}

	export function intRange(rStart: number, rEnd: number) {
		return (value: unknown): value is number => {
			return integer(value) && value >= rStart && value <= rEnd;
		};
	}

	function record(value: unknown): value is Record<string, unknown> {
		return typeIs(value, "table") && typeIs(next(value)[0], "string");
	}

	export function undefined(value: unknown): value is undefined {
		return value === undefined;
	}

	export function struct<T extends { [index: string]: check<unknown> }>(
		validators: T,
	): check<{ [P in keyof T]: value<T[P]> }> {
		return (value: unknown): value is { [P in keyof T]: value<T[P]> } => {
			if (record(value)) {
				for (const [k, v] of pairs(validators as { [P in string]: check<unknown> })) {
					const innerValue = value[k];
					if (!v(innerValue)) {
						return false;
					}
				}

				return true;
			} else {
				return false;
			}
		};
	}

	export const Instance = (value: unknown): value is Instance => typeIs(value, "Instance");

	export function InstanceIsA<TInstanceClassName extends keyof Instances>(className: TInstanceClassName) {
		return (value: unknown): value is Instances[TInstanceClassName] => {
			return Instance(value) && value.IsA(className);
		};
	}

	export const Player = InstanceIsA("Player");
	export const EnumItem = <E extends Enum>(rbxEnum: E): check<ReturnType<E["GetEnumItems"]>[number]> => (
		value,
	): value is ReturnType<E["GetEnumItems"]>[number] => {
		return typeIs(value, "EnumItem") && value.EnumType === rbxEnum;
	};

	function values<T extends object>(object: T): ReadonlyArray<NonNullable<T[keyof T]>> {
		const values = new Array<T[keyof T] & defined>();
		for (const [, value] of pairs(object)) {
			values.push(value as T[keyof T] & defined);
		}
		return values as Array<NonNullable<T[keyof T]>>;
	}

	export const TSEnum = <K>(enumLike: { [P in keyof K]: K[P] }): check<K[keyof K]> => (
		value: unknown,
	): value is K[keyof K] => {
		const enumValues = (values(enumLike) as unknown) as Array<string | number>;
		const enumType = typeOf(enumValues[0]);

		if (!typeIs(value, enumType)) {
			return false;
		}

		return enumValues.includes(value as string | number);
	};

	export const unknown: check<unknown> = (value): value is unknown => true;
}

export type BasicValidators = keyof ExtractMembers<typeof types, types.check<unknown>>;
export type NetworkableTypes = types.value<typeof types[keyof ExtractMembers<typeof types, types.check<unknown>>]>;

const test = types.struct({
	Projectile: types.InstanceIsA("BasePart"),
});
