import { MiddlewareOverload } from "../helpers/EventConstructor";
import { MiddlewareList } from "./MiddlewareEvent";
import { default as AsyncFunction } from "./ServerAsyncFunction";
import { default as Event, ServerEvent } from "./ServerEvent";
import { default as CrossServerEvent } from "./GlobalServerEvent";
import { default as CreateListener } from "./CreateServerListener";
import config from "../configuration";
import t from "@rbxts/t";

export { Event, AsyncFunction, CrossServerEvent, CreateListener };

/**
 * Creates an event on the server
 *
 * Programmatically equivalent to `new Net.Server.Event(name, middleware)`
 *
 * @param name The name of the event
 * @param middleware The middleware attached to this event
 */
export function CreateEvent(name: string, middleware?: MiddlewareList) {
	return new ServerEvent(name, middleware);
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
	return new AsyncFunction(name, middleware);
}

type EvtConstructor = readonly [name: string, ...mw: MiddlewareOverload<unknown[]>];
type InferMiddlewareTypes<T> = T extends [string, ...MiddlewareOverload<infer A>]
	? ServerEvent<A>
	: T extends string
	? ServerEvent
	: never;
type Overloaded<Tuple extends [...any[]]> = {
	[Index in keyof Tuple]: InferMiddlewareTypes<Tuple[Index]>;
};

export function CreateEvents<T extends (string | EvtConstructor)[]>(...evts: T): Overloaded<T> {
	const evtMap = new Array<ServerEvent>();
	for (const id of evts) {
		if (typeIs(id, "string")) {
			evtMap.push(new ServerEvent(id));
		} else {
			const [name] = id;
			const middleware = select(2, ...id) as LuaTuple<MiddlewareList>;
			evtMap.push(new ServerEvent(name, middleware));
		}
	}
	return evtMap as Overloaded<T>;
}

export const SetConfiguration = config.SetConfiguration;
export const GetConfiguration = config.GetConfiguration;
