/* eslint-disable no-restricted-syntax */
import { MiddlewareOverload } from "../middleware";
import { findOrCreateRemote, IS_SERVER, TagId } from "../internal";
import MiddlewareEvent from "./MiddlewareEvent";
import MiddlewareFunction from "./MiddlewareFunction";
import { ServerNetworkModelConfiguration } from "../definitions/Classes/ServerRemoteContext";
const CollectionService = game.GetService("CollectionService");

export default class ServerFunction<
	CallbackArgs extends ReadonlyArray<unknown> = Array<unknown>,
	Returns = unknown
> extends MiddlewareFunction {
	private instance: RemoteFunction;

	public readonly DefaultFunctionHook = (player: Player, ...args: Array<unknown>) => {
		this.configuration.OnRecieveFunctionCallWithNoCallback?.(this.instance.Name, player, args);
		return undefined;
	};

	public constructor(
		name: string,
		middlewares: MiddlewareOverload<CallbackArgs> = [],
		private configuration: ServerNetworkModelConfiguration,
	) {
		super(middlewares);
		this.instance = findOrCreateRemote("RemoteFunction", name, instance => {
			// Default listener
			instance.OnServerInvoke = this.DefaultFunctionHook;
			CollectionService.AddTag(instance, TagId.DefaultFunctionListener);
		});
		assert(IS_SERVER, "Cannot create a Net.ServerFunction on the Client!");
	}

	/** @internal */
	public GetInstance() {
		return this.instance;
	}

	public SetCallback<R extends Returns>(callback: (player: Player, ...args: CallbackArgs) => R) {
		if (CollectionService.HasTag(this.instance, TagId.DefaultFunctionListener)) {
			CollectionService.RemoveTag(this.instance, TagId.DefaultFunctionListener);
		}

		const id = this.instance.Name;
		const microprofile = this.configuration.MicroprofileCallbacks;

		this.instance.OnServerInvoke = (player: Player, ...args: ReadonlyArray<unknown>) => {
			if (microprofile) debug.profilebegin(`NetFunction: ${id}`);

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
