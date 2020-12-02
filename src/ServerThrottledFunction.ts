import NetServerFunction from "./ServerFunction";
import { createDeprecatedThrottledConstructor } from "./utility";

const NetServerThrottledFunction = createDeprecatedThrottledConstructor(
	<C extends Array<unknown> = Array<unknown>>(name: string, rateLimit: number, ...recievedPropTypes: C) => {
		warn(
			"[rbx-net] NetServerThrottledFunction is deprecated - see https://github.com/roblox-aurora/rbx-net/issues/20",
		);
		const remote = new NetServerFunction(name, ...recievedPropTypes);
		remote.SetRateLimit(rateLimit);
		return remote;
	},
	NetServerFunction,
);

export default NetServerThrottledFunction;
