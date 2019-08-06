import { findOrCreateRemote, IS_CLIENT, TypeGuard, StaticArguments, t_assert } from "./internal";

const Players = game.GetService("Players");
/**
 * An event on the server
 * @rbxts server
 */
export default class NetServerEvent<C extends Array<any> = Array<unknown>, F extends Array<any> = Array<unknown>>
	implements IServerNetEvent {
	/** @internal */
	protected instance: RemoteEvent;
	protected propTypes: C | undefined;
	protected callTypes: F | undefined;

	/**
	 * Creates a new instance of a server event (Will also create the corresponding remote if it does not exist!)
	 * @param name The name of this server event
	 * @throws If not created on server
	 */
	constructor(name: string, ...recievedPropTypes: C) {
		this.instance = findOrCreateRemote("RemoteEvent", name);
		assert(!IS_CLIENT, "Cannot create a Net.ServerEvent on the Client!");

		if (recievedPropTypes) {
			this.propTypes = recievedPropTypes;
		}
	}

	public WithStaticCalls<F0 extends F>(...callPropTypes: F0): NetServerEvent<C, F0> {
		this.callTypes = callPropTypes;
		return (this as unknown) as NetServerEvent<C, F0>;
	}

	/**
	 * The RemoteEvent instance
	 */
	public getInstance() {
		return this.instance;
	}

	/**
	 * The RBXScriptSignal for this RemoteEvent
	 */
	public getEvent() {
		return this.instance.OnServerEvent;
	}

	/**
	 * Connect a fucntion to fire when the event is invoked by the client
	 * @param callback The function fired when the event is invoked by the client
	 */
	public Connect(callback: (sourcePlayer: Player, ...args: StaticArguments<C>) => void) {
		if (this.propTypes !== undefined) {
			return this.getEvent().Connect((sourcePlayer: Player, ...args: Array<unknown>) => {
				if (t_assert(this.propTypes!, args)) {
					callback(sourcePlayer, ...(args as StaticArguments<C>));
				}
			});
		} else {
			return this.getEvent().Connect(callback as Callback);
		}
	}

	/**
	 * Sends the specified arguments to all players
	 * @param args The arguments to send to the players
	 */
	public SendToAllPlayers(...args: StaticArguments<F>) {
		this.instance.FireAllClients(...args);
	}

	/**
	 * Will send this message to all players except specified players
	 * @param blacklist The blacklist
	 * @param args The arguments
	 */
	public SendToAllPlayersExcept(blacklist: Player | Array<Player>, ...args: StaticArguments<F>) {
		if (typeIs(blacklist, "Instance")) {
			const otherPlayers = Players.GetPlayers().filter(p => p !== blacklist);
			for (const player of otherPlayers) {
				this.instance.FireClient(player, ...args);
			}
		} else if (typeIs(blacklist, "table")) {
			for (const player of Players.GetPlayers()) {
				if (blacklist.indexOf(player) === -1) {
					this.instance.FireClient(player, ...args);
				}
			}
		}
	}

	/**
	 * Sends the specified arguments to a specified player
	 * @param player The player
	 * @param args The arguments to send to the player
	 */
	public SendToPlayer(player: Player, ...args: StaticArguments<F>) {
		this.instance.FireClient(player, ...args);
	}

	/**
	 * Sends the specified argumetns to the specified list of players
	 * @param players The players
	 * @param args The arugments to send to these players
	 */
	public SendToPlayers(players: Array<Player>, ...args: StaticArguments<F>) {
		for (const player of players) {
			this.SendToPlayer(player, ...args);
		}
	}
}
