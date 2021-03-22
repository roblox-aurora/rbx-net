import * as NetServerContext from "./server";
import * as NetClientContext from "./client";
import NetDefinitions from "./definitions";
import { NetMiddleware } from "./middleware";
import { $env, $ifEnv } from "rbxts-transform-env";
import { $dbg } from "rbxts-transform-debug";
import NetSerialization from "./serialization";

const BUILD_TYPE = $env("TYPE", "TS");

// Types for Net
namespace Net {
	/**
	 * Middleware function type for Net
	 */
	export type Middleware = NetMiddleware;

	/**
	 * An object that contains a `Serialize` method.
	 * @internal Still in development
	 */
	export type Serializable<T> = Serialization.Serializable<T>;

	/**
	 * A serialized representation of the object
	 * @internal Still in development
	 */
	export type Serialized<T> = Serialization.Serialized<T>;
}

/**
 * Networking Library for Roblox
 * @version 2.0
 */
namespace Net {
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
	 * Network serialization namespace
	 * @internal Still in development
	 */
	export const Serialization = NetSerialization;
}

$ifEnv("NODE_ENV", "development", () => {
	$dbg(Net.VERSION);
});

export = Net;
