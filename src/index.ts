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
 * @version 2.0
 */
namespace Net {
	/**
	 * An object that contains a `Serialize` method.
	 * @internal Still in development
	 */
	export type Serializable<T> = NetSerialization.Serializable<T>;

	// /**
	//  * A serialized representation of the object
	//  * @internal Still in development
	//  */
	// export type Serialized<T> = Serialization.Serialized<T>;

	/**
	 * Legacy client API for Net
	 */
	export const Client = NetClientContext;

	/**
	 * Legacy server API for Net
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
	 * Built-in middlewares
	 */
	export const Middleware = NetMiddleware;
	/**
	 * Middleware function type for Net
	 */
	export type Middleware = NetMiddleware;

	/**
	 * Network serialization namespace
	 * @internal Still in development
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
