/// <reference types="@rbxts/types" />
/**
 * A function on the server
 * @rbxts server
 */
export default class NetServerFunction<CR extends any = any> {
    /** @internal */
    protected instance: RemoteFunction;
    constructor(name: string);
    /**
     * The callback function
     */
    getCallback(): Callback;
    /**
     * Set the callback function when called by the client
     */
    setCallback(func: Callback): this;
    /**
     * The RemoteFunction instance
     */
    getInstance(): RemoteFunction;
    /**
     * The client cache in seconds
     */
    getClientCache(): number;
    /**
     * Sets a client cache timer in seconds
     * @param time seconds to cache on client
     */
    setClientCache(time: number): this;
    /**
     * Calls the player and returns a promise
     * @async returns Promise
     * @param player The player to call the function on
     * @param args The arguments to call the function with
     */
    CallPlayerAsync<T extends Array<any>>(player: Player, ...args: T): Promise<CR>;
}
