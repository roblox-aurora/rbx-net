import ServerEventV2 from "./ServerEvent";
import { NetMiddleware } from "../middleware";

type MiddlewareOverload = [
	middleware: Array<NetMiddleware<any>>,
	callback: (player: Player, ...args: Array<unknown>) => void,
];
type CreateServerListenerOverloads = [callback: (player: Player, ...args: Array<unknown>) => void] | MiddlewareOverload;

function isMiddlewareArgument<T>(args: Array<unknown>): args is MiddlewareOverload {
	return args.size() > 1 && typeIs(args[0], "table");
}

/**
 * Creates a server listening event
 */
export default function createServerListener<T extends Array<unknown>>(
	id: string,
	callback: (player: Player, ...args: T) => void,
): RBXScriptConnection;
export default function createServerListener<M0 extends Array<unknown>>(
	id: string,
	middleware: [NetMiddleware<M0>],
	callback: (player: Player, ...args: M0) => void,
): RBXScriptConnection;
export default function createServerListener<M0 extends Array<unknown>, M1 extends Array<unknown>>(
	id: string,
	middleware: [NetMiddleware<M0>, NetMiddleware<M1, M0>],
	callback: (player: Player, ...args: M1) => void,
): RBXScriptConnection;
export default function createServerListener<
	M0 extends Array<unknown>,
	M1 extends Array<unknown>,
	M2 extends Array<unknown>
>(
	id: string,
	middleware: [NetMiddleware<M0>, NetMiddleware<M1, M0>, NetMiddleware<M2, M1>],
	callback: (player: Player, ...args: M2) => void,
): RBXScriptConnection;
export default function createServerListener(id: string, ...args: CreateServerListenerOverloads) {
	let event: ServerEventV2;
	if (isMiddlewareArgument(args)) {
		const [middleware, connect] = args;
		event = new ServerEventV2(id, middleware as [NetMiddleware<any>]);
		return event.Connect(connect);
	} else {
		const [connect] = args;
		event = new ServerEventV2(id);
		return event.Connect(connect);
	}
}
