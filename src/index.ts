/* eslint-disable roblox-ts/no-any */
import NetServerEventV2 from "./class/NetServerEvent";
import createClientListener from "./helpers/CreateClientListener";
import createServerListener from "./helpers/CreateServerListener";
import { Middleware } from "./middleware";

namespace Net {
	export const ServerEvent = NetServerEventV2;
	export type ServerEvent<T extends Array<unknown> = []> = NetServerEventV2<T>;

	export const CreateServerListener = createServerListener;
	export const CreateClientListener = createClientListener;
}

export = Net;
