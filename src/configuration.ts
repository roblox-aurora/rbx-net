import { IS_CLIENT } from "./internal";
import NetServerEvent from "./ServerEvent";
import NetServerFunction from "./ServerFunction";
import NetServerAsyncFunction from "./ServerAsyncFunction";

const runService = game.GetService("RunService");

const IS_SERVER = runService.IsServer();

type InvalidPropTypesHandler = (
	who: NetServerEvent | NetServerFunction | NetServerAsyncFunction,
	srcPlayer: Player,
) => void;

interface RbxNetConfigItem {
	/**
	 * The throttle reset timer (default: 60 seconds)
	 */
	ServerThrottleResetTimer: number;

	EnableDebugMessages: boolean;

	InvalidPropTypesHandler?: InvalidPropTypesHandler;

	/**
	 * The message shown when the throttle has been exceeded.
	 * {player} will be replaced with the player's name!
	 */
	ServerThrottleMessage: string;

	/** @internal */
	__stfuTypescript: undefined;
}

let throttleResetTimer = 60;
let rateLimitReachedMessage = "Request limit exceeded ({limit}) by {player} via {remote}";
namespace NetConfig {
	/** @internal */
	export let DebugEnabled = false;

	/** @internal */
	export let InvalidPropTypesHandlerFunc: InvalidPropTypesHandler | undefined;

	/** @rbxts client */
	export function SetClientConfiguration<K extends keyof Pick<RbxNetConfigItem, "EnableDebugMessages">>(
		key: K,
		value: RbxNetConfigItem[K],
	): void {
		assert(IS_CLIENT, "Use SetConfiguration on the server!");
		if (key === "EnableDebugMessages") {
			DebugEnabled = value as boolean;
		}
	}

	/** @rbxts server */
	export function SetConfiguration<K extends keyof RbxNetConfigItem>(key: K, value: RbxNetConfigItem[K]) {
		assert(IS_SERVER, "Cannot set configuration on client!");
		if (key === "ServerThrottleResetTimer") {
			throttleResetTimer = value as number;
		} else if (key === "ServerThrottleMessage") {
			rateLimitReachedMessage = value as string;
		} else if (key === "EnableDebugMessages") {
			DebugEnabled = value as boolean;
		} else if (key === "InvalidPropTypesHandler") {
			InvalidPropTypesHandlerFunc = value as InvalidPropTypesHandler;
		}
	}

	export function GetConfiguration<K extends keyof RbxNetConfigItem>(key: K): RbxNetConfigItem[K] {
		if (key === "ServerThrottleResetTimer") {
			assert(IS_SERVER, "ServerThrottleResetTimer is not used on the client!");
			return throttleResetTimer as RbxNetConfigItem[K];
		} else if (key === "ServerThrottleMessage") {
			assert(IS_SERVER, "ServerThrottleMessage is not used on the client!");
			return rateLimitReachedMessage as RbxNetConfigItem[K];
		} else if (key === "EnableDebugMessages") {
			return DebugEnabled as RbxNetConfigItem[K];
		} else {
			return undefined as RbxNetConfigItem[K];
		}
	}

	/** @internal */
	export function DebugWarn(...message: Array<unknown>) {
		if (DebugEnabled) {
			warn("[rbx-net-debug]", ...message);
		}
	}

	/** @internal */
	export function DebugLog(...message: Array<unknown>) {
		if (DebugEnabled) {
			print("[rbx-net-debug]", ...message);
		}
	}
}

export = NetConfig;
