import NetServerEventV2 from "class/NetServerEvent";

namespace Net {
	export const ServerEvent = NetServerEventV2;
	export type ServerEvent<T extends Array<unknown> = []> = NetServerEventV2<T>;
}

export = Net;
