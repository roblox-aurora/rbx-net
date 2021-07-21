import { MiddlewareOverload } from "../middleware";
import { findOrCreateRemote, IS_SERVER } from "../internal";
import MiddlewareEvent from "./MiddlewareEvent";
import MiddlewareFunction from "./MiddlewareFunction";
import { NetEvents } from "../internal/Events";

export default class ServerFunction<
	CallbackArgs extends ReadonlyArray<unknown> = Array<unknown>,
	Returns extends unknown = unknown
> extends MiddlewareFunction {
	private instance: RemoteFunction;

	public readonly DefaultFunctionHook = (player: Player) => {
		NetEvents.ServerRemoteCalledWithNoHandler.Fire(player, this);
		return undefined;
	};

	constructor(name: string, middlewares: MiddlewareOverload<CallbackArgs> = []) {
		super(middlewares);
		this.instance = findOrCreateRemote("RemoteFunction", name, (instance) => {
			// Default listener
			instance.OnServerInvoke = this.DefaultFunctionHook;
		});
		assert(IS_SERVER, "Cannot create a Net.ServerFunction on the Client!");

		// Default listener
		this.instance.OnServerInvoke = this.DefaultFunctionHook;
	}

	/** @internal */
	public GetInstance() {
		return this.instance;
	}

	/**
	 * Get the id of this remote event
	 * @returns The id
	 */
	public GetId() {
		return this.instance.Name;
	}

	public SetCallback<R extends Returns>(callback: (player: Player, ...args: CallbackArgs) => R) {
		this.instance.OnServerInvoke = (player: Player, ...args: ReadonlyArray<unknown>) => {
			const result: Promise<unknown> | unknown = this._processMiddleware<CallbackArgs, R>(callback)?.(
				player,
				...(args as CallbackArgs),
			);
			if (Promise.is(result)) {
				warn("[rbx-net] WARNING: Promises should be used with an AsyncFunction!");
				const [success, value] = result.await();
				if (success) {
					return value;
				} else {
					throw value;
				}
			}

			return result;
		};
	}
}
