import { isMixed } from "./tables";

export interface ValidatorLike {
	readonly errorMessage: string;
	readonly check: (value: unknown) => boolean;
}

export interface Validator<T> extends ValidatorLike {
	readonly check: (value: unknown) => value is T;
}

type NetworkValue = string | number | boolean | Instance | CFrame | Vector3 | Vector2 | Region3;

const Workspace = game.GetService("Workspace");
const ServerStorage = game.GetService("ServerStorage");
const ServerScriptService = game.GetService("ServerScriptService");

/** @internal */
export function validateArguments(...args: unknown[]) {
	for (const [index, value] of ipairs(args)) {
		if (!isSerializable.check(value)) {
			error(isSerializable.errorMessage.format(index), 2);
		}
		if (typeIs(value, "Instance")) {
			if (value.IsDescendantOf(ServerStorage) || value.IsDescendantOf(ServerScriptService)) {
				error(
					`[rbx-net] Instance at argument #${index} is inside a server-only container and cannot be sent via remotes.`,
				);
			}
			if (!value.IsDescendantOf(game)) {
				error(`[rbx-net] Instance at argument #${index} is not a valid descendant of game, and wont replicate`);
			}
		}
	}
}

/** @internal */
export const isSerializable: Validator<NetworkValue> = {
	errorMessage: `Argument #%d is not serializable. - see http://docs.vorlias.com/rbx-net/docs/2.0/serialization`,
	check: (value): value is NetworkValue => {
		// Can't allow functions or threads
		if (typeIs(value, "function") || typeIs(value, "thread")) {
			return false;
		}

		// Can't allow metatabled objects
		if (typeIs(value, "table") && getmetatable(value) !== undefined) {
			return false;
		}

		// Ensure not a mixed table type
		if (typeIs(value, "table")) {
			return !isMixed(value);
		}

		return true;
	},
};

/** @internal */
export function oneOf<T extends string>(...values: T[]): Validator<T> {
	return {
		errorMessage: `Expected one of: ${values.join(", ")}` as string,
		check: (value: unknown): value is T => {
			if (!typeIs(value, "string")) return false;

			for (const cmpValue of values) {
				if (value === cmpValue) {
					return true;
				}
			}

			return false;
		},
	} as const;
}
