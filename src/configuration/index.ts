import { $env } from "rbxts-transform-env";
import MiddlewareEvent from "../server/MiddlewareEvent";
import MiddlewareFunction from "../server/MiddlewareFunction";
import { IS_CLIENT } from "../internal";

const runService = game.GetService("RunService");

const IS_SERVER = runService.IsServer();

type ErrorHandler = (message: string, invokedBy: MiddlewareEvent | MiddlewareFunction) => void;

interface MutableClientConfiguration {
	EnableDebugMessages: boolean;
}

interface MutableConfiguration extends MutableClientConfiguration {
	/** @deprecated */
	ServerThrottleResetTimer: number;
	/** @deprecated */
	ServerThrottleMessage: string;
}

interface ClientConfiguration extends Readonly<MutableClientConfiguration> {}
interface Configuration extends Readonly<MutableConfiguration> {}

let Configuration: Writable<Configuration> = {
	ServerThrottleResetTimer: 60,
	EnableDebugMessages: $env<string>("NODE_ENV") === "development",
	ServerThrottleMessage: "Request limit exceeded ({limit}) by {player} via {remote}",
};

namespace NetConfig {
	/** @internal */
	export const DebugEnabled = $env<string>("NODE_ENV") === "development";

	export function SetClient(config: Partial<MutableClientConfiguration>) {
		assert(IS_CLIENT, "Use SetClient on the client!");
		Configuration = { ...Configuration, ...config };
	}

	export function Set(config: Partial<MutableConfiguration>) {
		assert(IS_SERVER, "Use Set on the server!");
		Configuration = { ...Configuration, ...config };
	}

	export function Get() {
		return Configuration as Readonly<Configuration>;
	}

	/**
	 * @deprecated
	 * @rbxts client
	 */
	export function SetClientConfiguration<K extends keyof ClientConfiguration>(
		key: K,
		value: ClientConfiguration[K],
	): void {
		assert(IS_CLIENT, "Use SetConfiguration on the server!");
		if (key === "EnableDebugMessages") {
			Configuration.EnableDebugMessages = value;
		}
	}

	/**
	 * @rbxts server
	 * @deprecated
	 * */
	export function SetConfiguration<K extends keyof Configuration>(key: K, value: Configuration[K]) {
		assert(IS_SERVER, "Cannot set configuration on client!");
		Configuration[key] = value;
	}

	/**
	 * @deprecated
	 */
	export function GetConfiguration<K extends keyof Configuration>(key: K): Configuration[K] {
		return Configuration[key];
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
