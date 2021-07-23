import * as NetServerContext from "./server";
import * as NetClientContext from "./client";
import NetDefinitions from "./definitions";
import { createTypeChecker, NetMiddleware } from "./middleware";
import { $env, $ifEnv } from "rbxts-transform-env";
import { $dbg } from "rbxts-transform-debug";
import type { $DebugInfo } from "rbxts-transform-debug";
import NetSerialization from "./serialization";
import { NetEvents } from "./internal/Events";
import Signal from "./internal/Signal";

const BUILD_TYPE = $env("TYPE", "TS");

/**
 * Networking Library for Roblox
 * @version 3.0
 */
namespace Net {
	/**
	 * Legacy client API for Net
	 * @hidden
	 * @deprecated Use `Net.Definitions`.
	 */
	export const Client = NetClientContext;

	/**
	 * Legacy server API for Net
	 * @hidden
	 */
	export const Server = NetServerContext;

	/**
	 * The definitions API for Net
	 */
	export const Definitions = NetDefinitions;

	/**
	 * Connects to local events for purposes of analytics/error reporting
	 * @param key The key of the vent
	 * @param value The callback
	 * @returns The connection
	 */
	export function On<K extends ExtractKeys<NetEvents, Signal>>(
		key: K,
		value: NetEvents.SignalCallback<NetEvents[K]>,
	) {
		return NetEvents[key].Connect(value);
	}

	/**
	 * The version of RbxNet
	 */
	export const VERSION = `${PKG_VERSION} (${
		$env<"production" | "development">("NODE_ENV", "production") === "development"
			? "DEV " + BUILD_TYPE
			: BUILD_TYPE
	})`;

	/**
	 * Middleware namespace
	 * @version 2.0
	 */
	export const Middleware = NetMiddleware;
	export type Middleware = NetMiddleware;

	/**
	 * Network serialization namespace
	 * @version 3.0
	 */
	export const Serialization = NetSerialization;
}

$ifEnv("NODE_ENV", "development", () => {
	$dbg(Net.VERSION);

	const sanity = (value: unknown, debug: $DebugInfo) => {
		if (value === undefined) {
			throw `[${debug.file}:${debug.lineNumber}] ${debug.rawText} - FAIL`;
		} else {
			print(`[${debug.file}:${debug.lineNumber}] ${debug.rawText} - OK`);
		}
	};

	$dbg(Net.Definitions, sanity);

	$dbg(Net.Server, sanity);
	$dbg(Net.Server.Function, sanity);
	$dbg("new" in Net.Server.Function);
	$dbg(Net.Server.Event, sanity);
	$dbg(Net.Server.AsyncFunction, sanity);

	$dbg(Net.Client, sanity);
	$dbg(Net.Client.Function, sanity);
	$dbg(Net.Client.Event, sanity);
	$dbg(Net.Client.AsyncFunction, sanity);

	$dbg(createTypeChecker, sanity);
	Net.On("ServerRemoteCalledWithNoHandler", (player, remote) => {
		warn("ServerRemoteCalledWithNoHandler", player, remote.GetId());
	});
});

export = Net;
