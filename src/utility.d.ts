declare namespace NetUtility {
	/**
	 * Checks whether or not this is a valid network map
	 * @param value
	 */
	export function IsNetworkMap(value: unknown): value is Map<string, unknown>;
	/**
	 * Checks whether or not this is a valid network table
	 * @param value The value to check
	 */
	export function IsNetworkTable(value: unknown): value is unknown[];
	/**
	 * Returns whether or not this is a valid network value
	 * This is `string`, `number`, `boolean`, `Array`, `Map` and any `Instance` that's a descendant of the DataModel
	 * @param value The value to check
	 */
	export function IsNetworkValue(
		value: unknown,
	): value is string | number | boolean | Array<unknown> | Map<string | number, unknown> | Instance;

	/**
	 * Returns whether or not this is a mixed table value
	 * @param value The value to check
	 */
	export function IsMixedTable(value: unknown): boolean;
}

export = NetUtility;
export as namespace NetUtility;
