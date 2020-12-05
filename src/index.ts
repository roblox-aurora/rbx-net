import * as NetServerContext from "./server";
import * as NetClientContext from "./client";

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
}

export = Net;
