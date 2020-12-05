import * as NetServerContext from "./server";
import * as NetClientContext from "./client";
import config from "./configuration";

/**
 * Networking Library for Roblox
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

	export const VERSION = PKG_VERSION;
}

export = Net;
