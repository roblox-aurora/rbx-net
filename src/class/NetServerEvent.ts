import { Middleware, NextCaller } from "../middleware";
import { findOrCreateRemote, IS_CLIENT, IS_RUNNING, NetManagedEvent } from "../internal";

interface Signalable<CallArguments extends Array<unknown>, PlayerArgument extends defined = Player> {
	Connect(callback: (player: PlayerArgument, ...args: CallArguments) => void): RBXScriptConnection;
}

class ServerEventV2<CallArguments extends Array<unknown> = Array<unknown>>
	implements NetManagedEvent, Signalable<CallArguments, Player> {
	private instance: RemoteEvent;
	public constructor(name: string, private readonly middlewares: Array<Middleware<Array<unknown>>> = []) {
		this.instance = findOrCreateRemote("RemoteEvent", name);
		assert(!IS_CLIENT, "Cannot create a NetServerEvent on the client!");
	}

	public GetInstance() {
		return this.instance;
	}

	/**
	 * Connect a fucntion to fire when the event is invoked by the client
	 * @param callback The function fired when the event is invoked by the client
	 */
	public Connect(callback: (player: Player, ...args: CallArguments) => void): RBXScriptConnection {
		const { middlewares } = this;

		const connection = this.instance.OnServerEvent.Connect((player, ...args) => {
			try {
				if (middlewares.size() > 0) {
					let callbackFn = callback as NextCaller;

					// Run through each middleware
					for (const middleware of middlewares) {
						callbackFn = middleware(callbackFn, this) as NextCaller;
					}

					callbackFn(player, ...(args as CallArguments));
				} else {
					callback(player, ...(args as CallArguments));
				}
			} catch (e) {
				warn("[rbx-net] " + tostring(e));
			}
		});

		return connection;
	}

	/**
	 * Sends the specified arguments to all players
	 * @param args The arguments to send to the players
	 */
	public SendToAllPlayers(...args: Array<unknown>) {
		if (!IS_RUNNING) return;

		this.instance.FireAllClients(...args);
	}

	/**
	 * Will send this message to all players except specified players
	 * @param blacklist The blacklist
	 * @param args The arguments
	 */
	public SendToAllPlayersExcept(blacklist: Player | Array<Player>, ...args: Array<unknown>) {
		if (!IS_RUNNING) return;
		const Players = game.GetService("Players");

		if (typeIs(blacklist, "Instance")) {
			const otherPlayers = Players.GetPlayers().filter((p) => p !== blacklist);
			for (const player of otherPlayers) {
				this.instance.FireClient(player, ...(args as Array<unknown>));
			}
		} else if (typeIs(blacklist, "table")) {
			for (const player of Players.GetPlayers()) {
				if (blacklist.indexOf(player) === -1) {
					this.instance.FireClient(player, ...(args as Array<unknown>));
				}
			}
		}
	}

	/**
	 * Sends the specified arguments to a specified player
	 * @param player The player
	 * @param args The arguments to send to the player
	 */
	public SendToPlayer(player: Player, ...args: Array<unknown>) {
		if (!IS_RUNNING) return;

		this.instance.FireClient(player, ...(args as Array<unknown>));
	}

	/**
	 * Sends the specified argumetns to the specified list of players
	 * @param players The players
	 * @param args The arugments to send to these players
	 */
	public SendToPlayers(players: Array<Player>, ...args: Array<unknown>) {
		if (!IS_RUNNING) return;

		for (const player of players) {
			this.SendToPlayer(player, ...args);
		}
	}
}

type EnhancedServerEventV2<M0 = defined, M1 = defined, M2 = defined, M3 = defined> = M3 extends Middleware<
	infer A,
	infer _
>
	? ServerEventV2<A>
	: M2 extends Middleware<infer A, infer _>
	? ServerEventV2<A>
	: M1 extends Middleware<infer A, infer _>
	? ServerEventV2<A>
	: M0 extends Middleware<infer A, infer _>
	? ServerEventV2<A>
	: ServerEventV2;

type PlayerEnhancer<M0> = M0 extends Middleware<infer _, infer _, infer A> ? Signalable<any, A> : never;

type InferPrevType<T> = T extends Middleware<infer A> ? A : never;
type InferPrevSender<T> = T extends Middleware<infer _, infer _, infer A> ? A : never;

export interface ServerEventV2Constructor {
	/**
	 * Creates a new server event
	 *
	 * @param name The name of the event
	 */
	new <T extends Array<unknown>>(name: string): ServerEventV2<T>;

	/**
	 * Creates a new middleware augmented Server Event
	 *
	 * e.g. (using `t`)
	 * ```ts
	 * const myEvent = new Net.ServerEvent("Test", [
	 *		Net.Types(t.string, t.number)
	 * ])
	 * ```
	 * will ensure that events recieved have a `string` and `number` argument.
	 *
	 * @param name The name of the event
	 * @param middlewares The middleware array
	 */
	new <M0 extends Middleware<any>>(name: string, middlewares: [middleware: M0]): EnhancedServerEventV2<M0>;
	new <
		M0 extends Middleware<any, any, any, any>,
		M1 extends Middleware<any, InferPrevType<M0>, any, InferPrevSender<M0>>
	>(
		name: string,
		middlewares: [middleware: M0, middleware: M1],
	): EnhancedServerEventV2<M0, M1> & PlayerEnhancer<M0>;
	new <
		M0 extends Middleware<any>,
		M1 extends Middleware<any, InferPrevType<M0>, any, InferPrevSender<M0>>,
		M2 extends Middleware<any, InferPrevType<M1>, any, InferPrevSender<M1>>
	>(
		name: string,
		middlewares: [middleware: M0, middleware: M1, middleware: M2],
	): EnhancedServerEventV2<M0, M1, M2>;
	new <
		M0 extends Middleware<any>,
		M1 extends Middleware<any, InferPrevType<M0>, any, InferPrevSender<M0>>,
		M2 extends Middleware<any, InferPrevType<M1>, any, InferPrevSender<M1>>,
		M3 extends Middleware<any, InferPrevType<M2>, any, InferPrevSender<M2>>
	>(
		name: string,
		middlewares: [middleware: M0, middleware: M1, middleware: M2, middleware: M3],
	): EnhancedServerEventV2<M0, M1, M2, M3>;
}

type NetServerEventV2<CallArguments extends Array<unknown> = []> = ServerEventV2<CallArguments>;
const NetServerEventV2 = ServerEventV2 as ServerEventV2Constructor;
export default NetServerEventV2;
