import NetServerFunction from "./ServerFunction";

/**
 * A server function that can be rate limited
 * @rbxts server
 * @deprecated Use NetServerFunction
 */
export default class NetServerThrottledFunction<C extends Array<any> = Array<unknown>> extends NetServerFunction<C> {
	constructor(name: string, rateLimit: number, ...recievedPropTypes: C) {
		super(name, ...recievedPropTypes);
		this.SetRateLimit(rateLimit);
	}
}
