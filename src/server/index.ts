import { MiddlewareOverload } from "../helpers/EventConstructor";
import { MiddlewareList } from "./NetMiddlewareEventHandler";
import NetServerAsyncFunction from "./NetServerAsyncFunction";
import NetServerEventV2, { NetServerEvent } from "./NetServerEvent";
import config from "../configuration";

export { default as Event } from "./NetServerEvent";
export { default as AsyncFunction } from "./NetServerAsyncFunction";
export { default as CrossServerEvent } from "./NetGlobalServerEvent";
export { default as CreateListener } from "./CreateServerListener";

/**
 * Creates an event on the server
 *
 * Programmatically equivalent to `new Net.Server.Event(name, middleware)`
 *
 * @param name The name of the event
 * @param middleware The middleware attached to this event
 */
export function CreateEvent(name: string, middleware?: MiddlewareList) {
	return new NetServerEvent(name, middleware);
}

/**
 * Creates a function on the server
 *
 * Programmatically equivalent to `new Net.Server.AsyncFunction(name, middleware)`
 *
 * @param name The name of the function
 * @param middleware The middleware attached to this function
 */
export function CreateAsyncFunction<CallArguments extends Array<unknown>>(
	name: string,
	middleware: MiddlewareOverload<CallArguments> = [],
) {
	return new NetServerAsyncFunction(name, middleware);
}

export const SetConfiguration = config.SetConfiguration;
export const GetConfiguration = config.GetConfiguration;
