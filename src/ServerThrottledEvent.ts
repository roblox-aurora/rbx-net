import NetServerEvent from "./ServerEvent";
import { createDeprecatedThrottledConstructor } from "./utility";

// /**
//  * A server event that can be rate limited
//  * @rbxts server
//  * @deprecated Use ServerEvent + SetRateLimit
//  */
// export default class NetServerThrottledEvent<C extends Array<any> = Array<unknown>> extends NetServerEvent<C> {
// 	constructor(name: string, rateLimit: number, ...recievedPropTypes: C) {
// 		super(name, ...recievedPropTypes);
// 		this.SetRateLimit(rateLimit);
// 	}
// }

const NetServerThrottledEvent = createDeprecatedThrottledConstructor(
	<C extends Array<any> = Array<unknown>>(name: string, rateLimit: number, ...recievedPropTypes: C) => {
		warn(
			"[rbx-net] NetServerThrottledEvent is deprecated - see https://github.com/roblox-aurora/rbx-net/issues/20",
		);
		const remote = new NetServerEvent(name, ...recievedPropTypes);
		remote.SetRateLimit(rateLimit);
		return remote;
	},
	NetServerEvent,
);

export default NetServerThrottledEvent;
