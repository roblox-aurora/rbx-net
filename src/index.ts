import * as NetServerContext from "./server";
import * as NetClientContext from "./client";
import NetDeclare from "./helpers/Declare";

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
	export const Definitions = NetDeclare;

	export const VERSION = PKG_VERSION;
}

export = Net;
