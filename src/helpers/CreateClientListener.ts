import ClientEvent from "../client/ClientEvent";
import { Middleware } from "../middleware";

type MiddlewareOverload = [middleware: Array<Middleware<any>>, callback: (...args: Array<unknown>) => void];
type CreateServerListenerOverloads = [callback: (...args: Array<unknown>) => void] | MiddlewareOverload;

function isMiddlewareArgument<T>(args: Array<unknown>): args is MiddlewareOverload {
	return args.size() > 1 && typeIs(args[0], "table");
}

/**
 * Creates a server listening event
 */
export default function createClientListener<T extends Array<unknown>>(
	id: string,
	callback: (...args: T) => void,
): RBXScriptConnection;
// export default function createClientListener<M0 extends Array<unknown>>(
// 	id: string,
// 	middleware: [Middleware<M0>],
// 	callback: (...args: M0) => void,
// ): RBXScriptConnection;
// export default function createClientListener<M0 extends Array<unknown>, M1 extends Array<unknown>>(
// 	id: string,
// 	middleware: [Middleware<M0>, Middleware<M1, M0>],
// 	callback: (...args: M1) => void,
// ): RBXScriptConnection;
// export default function createClientListener<
// 	M0 extends Array<unknown>,
// 	M1 extends Array<unknown>,
// 	M2 extends Array<unknown>
// >(
// 	id: string,
// 	middleware: [Middleware<M0>, Middleware<M1, M0>, Middleware<M2, M1>],
// 	callback: (...args: M2) => void,
// ): RBXScriptConnection;
export default function createClientListener(id: string, ...args: CreateServerListenerOverloads) {
	let event: ClientEvent;
	if (isMiddlewareArgument(args)) {
		// const [middleware, connect] = args;
		// event = new NetClientEvent(id, middleware as [Middleware<any>]);
		// return event.Connect(connect);
		throw `No Middleware`;
	} else {
		const [connect] = args;
		event = new ClientEvent(id);
		return event.Connect(connect);
	}
}
