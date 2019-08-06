/// <reference types="@rbxts/types" />
/**
 * A function on the client
 * @rbxts client
 */
export default class NetClientFunction<SR extends unknown> {
    /** @internal */
    private lastPing;
    /** @internal */
    private cached;
    /** @internal */
    private instance;
    constructor(name: string);
    static WaitFor<R extends any>(name: string): Promise<NetClientFunction<R>>;
    /**
     * The callback
     */
    getCallback(): Callback;
    /**
     * Set the callback function when called by the server
     */
    setCallback(func: Callback): void;
    /**
     * The remoteFunction instance
     */
    getInstance(): RemoteFunction;
    /**
     * The client cache in seconds
     */
    getCache(): number;
    /**
     * Call the server with the specified arguments
     * @param args The arguments to call the server with
     * @returns the result of the call to the server
     */
    CallServer<T extends Array<any>>(...args: T): SR;
    /**
     * Call the server with the specified arguments asynchronously
     * @param args The args to call the server with
     * @async Will return a promise
     */
    CallServerAsync<T extends Array<any>>(...args: T): Promise<SR>;
}
