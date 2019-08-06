/// <reference types="@rbxts/types" />
import NetServerEvent from "./ServerEvent";
/**
 * A server event that can be rate limited
 * @rbxts server
 */
export default class NetServerThrottledEvent extends NetServerEvent {
    private maxRequestsPerMinute;
    private clientRequests;
    constructor(name: string, rateLimit: number);
    /**
     * Connect a fucntion to fire when the event is invoked by the client
     * @param callback The function fired when the event is invoked by the client
     */
    Connect<T extends Array<any>>(callback: (sourcePlayer: Player, ...args: T) => void): RBXScriptConnection;
    /**
     * The number of requests allowed per minute per user
     */
    setRateLimit(requestsPerMinute: number): void;
    getRateLimit(): number;
}
