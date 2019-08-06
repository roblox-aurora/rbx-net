/// <reference types="@rbxts/types" />
import Serializer from "./Serializer";
import config from "./configuration";
import NetServerEvent from "./ServerEvent";
import NetClientEvent from "./ClientEvent";
import NetClientFunction from "./ClientFunction";
import NetServerFunction from "./ServerFunction";
import NetServerThrottledFunction from "./ServerThrottledFunction";
import NetServerThrottledEvent from "./ServerThrottledEvent";
import NetGlobalEvent from "./GlobalEvent";
import NetGlobalServerEvent from "./GlobalServerEvent";
interface ICreateFunctionOptions {
    name: string;
    callback?: Callback;
    cacheSeconds?: number;
    rateLimit?: number;
}
/**
 * Typescript Networking Library for ROBLOX
 */
declare namespace Net {
    interface VersionType {
        major: number;
        minor: number;
        revision: number;
    }
    interface VersionInformation {
        number: VersionType;
        date: number;
        tag?: string;
    }
    const SetConfiguration: typeof config.SetConfiguration;
    const GetConfiguration: typeof config.GetConfiguration;
    /**
     * Version information
     * @internal
     */
    const VERSION: VersionInformation;
    const ServerEvent: typeof NetServerEvent;
    type ServerEvent = NetServerEvent;
    const ClientEvent: typeof NetClientEvent;
    type ClientEvent = NetClientEvent;
    const ClientFunction: typeof NetClientFunction;
    type ClientFunction = NetClientEvent;
    const ServerFunction: typeof NetServerFunction;
    type ServerFunction = NetServerFunction;
    const GlobalEvent: typeof NetGlobalEvent;
    type GlobalEvent = NetGlobalEvent;
    const GlobalServerEvent: typeof NetGlobalServerEvent;
    type GlobalServerEvent = NetGlobalServerEvent;
    const ServerThrottledEvent: typeof NetServerThrottledEvent;
    type ServerThrottledEvent = NetServerThrottledEvent;
    const ServerThrottledFunction: typeof NetServerThrottledFunction;
    type ServerThrottledFunction = NetServerThrottledFunction;
    function IsClient(): boolean;
    function IsServer(): boolean;
    const Serialize: typeof Serializer.Serialize;
    const Deserialize: typeof Serializer.Deserialize;
    const IsSerializable: typeof Serializer.IsSerializable;
    /**
     * Create a function
     * @param nameOrOptions The name of the function
     * @rbxts server
     */
    function CreateFunction<CR extends any>(nameOrOptions: string | ICreateFunctionOptions): NetServerFunction<CR>;
    /**
     * Creates a function that has a limited number of client requests every timeout (default 60 seconds)
     * @param name The name of the function
     * @param rateLimit The amount of requests allowed by clients in the rate timeout (default 60 seconds)
     * @rbxts server
     */
    function CreateThrottledFunction<CR extends any>(name: string, rateLimit: number): NetServerThrottledFunction<CR>;
    /**
     * Creates an event that has a limited number of client requests every timeout (default 60 seconds)
     * @param name The name of the event
     * @param rateLimit The amount of requests allowed by clients in the rate timeout (default 60 seconds)
     * @rbxts server
     */
    function CreateThrottledEvent(name: string, rateLimit: number): NetServerThrottledEvent;
    /**
     * Create an event
     * @param name The name of the event
     * @rbxts server
     */
    function CreateEvent(name: string): NetServerEvent;
    /**
     * Wait for a client function specified by `name`
     *
     * Usage
     *
    ```ts
    Net.WaitForClientFunctionAsync("FunctionName").then(func => {
    func.Callback = clientCallbackFunction;
    }, err => {
    warn("Error fetching FunctionName:", err);
    });```
     *
     * Or inside an async function:
    ```ts
    const func = await Net.WaitForClientFunctionAsync("FunctionName");
    func.Callback = clientCallbackFunction;
    ```
     *
     * @param name The name of the function
     * @alias for `Net.ClientFunction.WaitFor(name)`
     * @returns `Promise<Net.ClientFunction>`
     * @rbxts client
     */
    function WaitForClientFunctionAsync<R extends any>(name: string): Promise<NetClientFunction<R>>;
    /**
     * Wait for a client function specified by `name`
     *
     * Usage
     *
    ```ts
    Net.WaitForClientEventAsync("EventName").then(event => {
    event.Connect(eventHandler);
    }, err => {
    warn("Error fetching EventName:", err);
    });```
     *
     * Or inside an async function:
    ```ts
    const event = await Net.WaitForClientEventAsync("EventName");
    event.Connect(eventHandler);
    ```
     *
     * @param name The name of the function
     * @alias for `Net.ClientEvent.WaitFor(name)`
     * @returns `Promise<Net.ClientEvent>`
     * @rbxts client
     */
    function WaitForClientEventAsync(name: string): Promise<NetClientEvent>;
    /** @rbxts server */
    function GetServerEventAsync(name: string): Promise<NetServerEvent>;
    /** @rbxts server */
    function GetServerFunctionAsync<CR extends any>(name: string): Promise<NetServerFunction<CR>>;
}
export = Net;
