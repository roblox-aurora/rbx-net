import { MiddlewareOverload } from "../helpers/EventConstructor";
import { MiddlewareList } from "./MiddlewareEvent";
import { default as AsyncFunction } from "./ServerAsyncFunction";
import ServerEvent, { default as Event } from "./ServerEvent";
import { default as CrossGameEvent } from "./ServerGameEvent";
import { default as CreateListener } from "./CreateServerListener";
import { default as Function } from "./ServerFunction";
import config from "../configuration";

export { Event, AsyncFunction, Function, CrossGameEvent, CreateListener };

/**
 * Creates an event on the server
 *
 * Programmatically equivalent to `new Net.Server.Event(name, middleware)`
 *
 * @param name The name of the event
 * @param middleware The middleware attached to this event
 */
export function CreateEvent<ConnectArgs extends unknown[], CallArgs extends unknown[]>(
	name: string,
	middleware?: MiddlewareOverload<ConnectArgs>,
) {
	return new ServerEvent<ConnectArgs, CallArgs>(name, middleware);
}

/**
 * Creates an event on the server
 * Same as `CreateEvent`, but type-wise removes `Connect`.
 */
export const CreateSender: <CallArgs extends Array<unknown>>(
	name: string,
) => Omit<ServerEvent<[], CallArgs>, "Connect"> = CreateEvent;

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

/**
 * An event declaration
 */
export type EventDeclaration = readonly [name: string, ...mw: MiddlewareOverload<unknown[]>];
type InferMiddlewareTypes<T> = T extends [string, ...MiddlewareOverload<infer A>]
	? ServerEvent<A>
	: T extends string
	? ServerEvent
	: never;
type EventArray<Tuple extends [...defined[]]> = {
	[Index in keyof Tuple]: InferMiddlewareTypes<Tuple[Index]>;
};
declare function unpack<T>(arr: Array<T>): LuaTuple<Array<T>>;

/**
 * Creates multiple server events by name, or declaration
 *
 * An example of a simple list of events is:
 *
 * ```ts
 * const [eventA, eventB] = Net.Server.CreateEvents("A", "B");
 * ```
 * Both `eventA` and `eventB` will be generic server events. If you want to include middleware, you can do:
 *
 * ```ts
 * const [eventA, middlewareEventB] = Net.Server.CreateEvents(
 * 	"A",
 * 	["B", createTypeChecker(t.string)]
 * )
 * ```
 * In this instance, it would be like doing `const middlewareEventB = new Net.Server.Event("B", [createTypeChecker(t.string)])`
 * Event A would still take any arguments, and Event B would take specific arguments (in this case, `string`)
 */
export function CreateEvents<T extends (string | EventDeclaration)[]>(...evts: T): LuaTuple<EventArray<T>> {
	const evtMap = new Array<ServerEvent>();
	for (const id of evts) {
		if (typeIs(id, "string")) {
			evtMap.push(new ServerEvent(id));
		} else {
			const [name] = id;
			const middleware = select(2, ...id) as LuaTuple<MiddlewareOverload<any>>;
			evtMap.push(new ServerEvent(name, middleware));
		}
	}
	return unpack(evtMap) as LuaTuple<EventArray<T>>;
}

/**
 * Set a configuration value for the server
 */
export const SetConfiguration = config.SetConfiguration;

/**
 * Get a configuration value for the server
 */
export const GetConfiguration = config.GetConfiguration;
