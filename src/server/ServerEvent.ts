import { Middleware, NextCaller } from "../middleware";
import { findOrCreateRemote, IS_CLIENT, IS_RUNNING, NetManagedEvent } from "../internal";
import MiddlewareEvent, { MiddlewareList } from "./MiddlewareEvent";
import { MiddlewareOverload } from "../helpers/EventConstructor";

interface Signalable<CallArguments extends Array<unknown>, PlayerArgument extends defined = Player> {
	Connect(callback: (player: PlayerArgument, ...args: CallArguments) => void): RBXScriptConnection;
}

export default class ServerEvent<
		ConnectArgs extends Array<unknown> = Array<unknown>,
		CallArgs extends Array<unknown> = Array<unknown>
	>
	extends MiddlewareEvent
	implements NetManagedEvent, Signalable<ConnectArgs, Player> {
	private instance: RemoteEvent;
	public constructor(name: string, middlewares: MiddlewareOverload<ConnectArgs> = []) {
		super(middlewares);
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
	public Connect(callback: (player: Player, ...args: ConnectArgs) => void): RBXScriptConnection {
		const connection = this.instance.OnServerEvent.Connect((player, ...args) => {
			this._processMiddleware(callback)?.(player, ...(args as ConnectArgs));
		});

		return connection;
	}

	/**
	 * Sends the specified arguments to all players
	 * @param args The arguments to send to the players
	 */
	public SendToAllPlayers(...args: CallArgs) {
		if (!IS_RUNNING) return;

		this.instance.FireAllClients(...args);
	}

	/**
	 * Will send this message to all players except specified players
	 * @param blacklist The blacklist
	 * @param args The arguments
	 */
	public SendToAllPlayersExcept(blacklist: Player | Array<Player>, ...args: CallArgs) {
		if (!IS_RUNNING) return;
		const Players = game.GetService("Players");

		if (typeIs(blacklist, "Instance")) {
			const otherPlayers = Players.GetPlayers().filter((p) => p !== blacklist);
			for (const player of otherPlayers) {
				this.instance.FireClient(player, ...(args as CallArgs));
			}
		} else if (typeIs(blacklist, "table")) {
			for (const player of Players.GetPlayers()) {
				if (blacklist.indexOf(player) === -1) {
					this.instance.FireClient(player, ...(args as CallArgs));
				}
			}
		}
	}

	/**
	 * Sends the specified arguments to a specified player
	 * @param player The player
	 * @param args The arguments to send to the player
	 */
	public SendToPlayer(player: Player, ...args: CallArgs) {
		if (!IS_RUNNING) return;

		this.instance.FireClient(player, ...(args as CallArgs));
	}

	/**
	 * Sends the specified argumetns to the specified list of players
	 * @param players The players
	 * @param args The arugments to send to these players
	 */
	public SendToPlayers(players: Array<Player>, ...args: CallArgs) {
		if (!IS_RUNNING) return;

		for (const player of players) {
			this.SendToPlayer(player, ...args);
		}
	}
}
