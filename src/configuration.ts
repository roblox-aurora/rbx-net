const runService = game.GetService("RunService");

const IS_SERVER = runService.IsServer();
const IS_STUDIO = runService.IsStudio();
import guidCache from "./GuidCache";

interface RbxNetConfigItem {
	/**
	 * The throttle reset timer (default: 60 seconds)
	 */
	ServerThrottleResetTimer: number;

	/**
	 * The message shown when the throttle has been exceeded.
	 * {player} will be replaced with the player's name!
	 */
	ServerThrottleMessage: string;

	/**
	 * Whether or not to use RemoteGUIDs. Must be set before the first remote is created!
	 */
	EXPERIMENTAL_RemoteGuidEnabled: boolean;

	/** @internal */
	__stfuTypescript: undefined;
}

let throttleResetTimer = 60;
let rateLimitReachedMessage = "Request limit exceeded ({limit}) by {player} via {remote}";

namespace NetConfig {
	export function SetConfiguration<K extends keyof RbxNetConfigItem>(key: K, value: RbxNetConfigItem[K]) {
		assert(IS_SERVER, "Cannot modify configuration on client!");
		if (key === "ServerThrottleMessage") {
			throttleResetTimer = value as number;
		} else if (key === "ServerThrottleMessage") {
			rateLimitReachedMessage = value as string;
		} else if (key === "EXPERIMENTAL_RemoteGuidEnabled") {
			if (guidCache.lock) {
				error(`[rbx-net] Cannot set ${key} after the first remote has been created!`);
			} else {
				guidCache.SetEnabled(value as boolean);
			}
		}
	}

	export function GetConfiguration<K extends keyof RbxNetConfigItem>(key: K): RbxNetConfigItem[K] {
		if (key === "ServerThrottleResetTimer") {
			assert(IS_SERVER, "ServerThrottleResetTimer is not used on the client!");
			return throttleResetTimer as RbxNetConfigItem[K];
		} else if (key === "ServerThrottleMessage") {
			assert(IS_SERVER, "ServerThrottleMessage is not used on the client!");
			return rateLimitReachedMessage as RbxNetConfigItem[K];
		} else if (key === "EXPERIMENTAL_RemoteGuidEnabled") {
			return guidCache.enabled as RbxNetConfigItem[K];
		} else {
			return undefined as RbxNetConfigItem[K];
		}
	}
}

export = NetConfig;
