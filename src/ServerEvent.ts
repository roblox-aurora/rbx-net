import { findOrCreateRemote, IS_CLIENT } from "./internal";
const Players = game.GetService("Players");

/**
 * An event on the server
 * @rbxts server
 */
export default class NetServerEvent implements IServerNetEvent {
	/** @internal */
	protected instance: RemoteEvent;

	/**
	 * Creates a new instance of a server event (Will also create the corresponding remote if it does not exist!)
	 * @param name The name of this server event
	 * @throws If not created on server
	 */
	constructor(name: string) {
		this.instance = findOrCreateRemote("RemoteEvent", name);
		assert(!IS_CLIENT, "Cannot create a Net.ServerEvent on the Client!");
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
	public Connect<T extends Array<unknown>>(callback: (sourcePlayer: Player, ...args: T) => void) {
		this.getEvent().Connect(callback as Callback);
	}

	/**
	 * Sends the specified arguments to all players
	 * @param args The arguments to send to the players
	 */
	public SendToAllPlayers<T extends Array<any>>(...args: T) {
		this.instance.FireAllClients(...args);
	}

	/**
	 * Will send this message to all players except specified players
	 * @param blacklist The blacklist
	 * @param args The arguments
	 */
	public SendToAllPlayersExcept<T extends Array<any>>(blacklist: Player | Array<Player>, ...args: T) {
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
	public SendToPlayer<T extends Array<any>>(player: Player, ...args: T) {
		this.instance.FireClient(player, ...args);
	}

	/**
	 * Sends the specified argumetns to the specified list of players
	 * @param players The players
	 * @param args The arugments to send to these players
	 */
	public SendToPlayers<T extends Array<any>>(players: Array<Player>, ...args: T) {
		for (const player of players) {
			this.SendToPlayer(player, ...args);
		}
	}
}
