import * as NetServerContext from "./server";
import * as NetClientContext from "./client";
import CreateNetDefinitionBuilder from "./helpers/Definitions";
import type { NetMiddleware } from "./middleware";
import { ifEnv } from "rbxts-transform-env";
import { IS_SERVER } from "./internal";

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
	export const CreateDefinitions = CreateNetDefinitionBuilder;

	export const VERSION = PKG_VERSION;

	/**
	 * Middleware function type for Net
	 */
	export type Middleware = NetMiddleware;
}

ifEnv("NODE_ENV", "development", () => {
	if (IS_SERVER) {
		Net.Server.SetConfiguration("EnableDebugMessages", true);
	} else {
		Net.Client.SetConfiguration("EnableDebugMessages", true);
	}
});

export = Net;
