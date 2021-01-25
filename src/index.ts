import * as NetServerContext from "./server";
import * as NetClientContext from "./client";
import NetDefinitions from "./definitions";
import { NetMiddleware, NetMiddlewares } from "./middleware";
import { $env, $ifEnv } from "rbxts-transform-env";
import { $dbg } from "rbxts-transform-debug";
import { IS_SERVER } from "./internal";
import NetSerialization from "./serializer";

const BUILD_TYPE = $env("TYPE", "TS");

/**
 * Networking Library for Roblox
 * @version 2.0
 */
namespace Net {
	/**
	 * All Net functions and classes relating to the client
	 */
	export const Client = NetClientContext;
	/**
	 * All Net functions and classes relating to the server
	 */
	export const Server = NetServerContext;

	/**
	 * @experimental
	 * Experimental definition builder for Net
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
	export const Middleware = NetMiddlewares;
	/**
	 * Middleware function type for Net
	 */
	export type Middleware = NetMiddleware;

	/**
	 * Network serialization namespace
	 * @internal Still in development
	 */
	export const Serialization = NetSerialization;

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

$ifEnv("NODE_ENV", "development", () => {
	$dbg(Net.VERSION);
	if (IS_SERVER) {
		Net.Server.SetConfiguration("EnableDebugMessages", true);
	} else {
		Net.Client.SetConfiguration("EnableDebugMessages", true);
	}
});

export = Net;
