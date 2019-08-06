/// <reference types="@rbxts/types" />
import NetServerFunction from "./ServerFunction";
/**
 * A server function that can be rate limited
 * @rbxts server
 */
export default class NetServerThrottledFunction<CR extends any = any> extends NetServerFunction<CR> {
    /** @internal */
    static rates: Map<string, number[]>;
    private maxRequestsPerMinute;
    private clientRequests;
    constructor(name: string, rateLimit: number);
    setCallback(callback: Callback): this;
    /**
     * The number of requests allowed per minute per user
     */
    setRateLimit(requestsPerMinute: number): void;
    getRateLimit(): number;
}
