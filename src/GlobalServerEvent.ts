import NetServerEvent from "./ServerEvent";
import NetGlobalEvent from "./GlobalEvent";
import { getGlobalRemote, IS_CLIENT, isLuaTable } from "./internal";
const Players = game.GetService("Players");

export interface IMessage {
	data: Array<unknown>;
	targetId?: number;
	targetIds?: Array<number>;
}

function isMessage(value: unknown): value is IMessage {
	if (isLuaTable(value)) {
		const hasData = value.has("data");
		return !value.isEmpty() && (hasData && typeOf(value.get("data")) === "table");
	} else {
		return false;
	}
}

/**
 * Similar to a ServerEvent, but works across all servers.
 */
export default class NetGlobalServerEvent implements INetXServerEvent {
	private readonly instance: NetServerEvent;
	private readonly event: NetGlobalEvent;

	constructor(name: string) {
		this.instance = new NetServerEvent(getGlobalRemote(name));
		this.event = new NetGlobalEvent(name);
		assert(!IS_CLIENT, "Cannot create a Net.GlobalServerEvent on the Client!");

		this.event.Connect(message => {
			if (isMessage(message)) {
				this.recievedMessage(message);
			} else {
				warn(`[rbx-net] Recieved malformed message for GlobalServerEvent: ${name}`);
			}
		});
	}

	private getPlayersMatchingId(matching: Array<number> | number) {
		if (typeIs(matching, "number")) {
			return Players.GetPlayerByUserId(matching);
		} else {
			const players = new Array<Player>();
			for (const id of matching) {
				const player = Players.GetPlayerByUserId(id);
				if (player) {
					players.push(player);
				}
			}

			return players;
		}
	}

	private recievedMessage(message: IMessage) {
		if (message.targetIds) {
			const players = this.getPlayersMatchingId(message.targetIds);
			if (players) {
				this.instance.SendToPlayers(players as Array<Player>, ...message.data);
			}
		} else if (message.targetId) {
			const player = this.getPlayersMatchingId(message.targetId);
			if (player) {
				this.instance.SendToPlayer(player as Player, ...message.data);
			}
		} else {
			this.instance.SendToAllPlayers(...message.data);
		}
	}

	/**
	 * SEnds an event to all servers in the game
	 * @param args The args of the message
	 */
	public SendToAllServers<T extends Array<unknown>>(...args: T) {
		this.event.SendToAllServers({ data: [...args] });
	}

	/**
	 * Sends an event to the specified server
	 * @param jobId The game.JobId of the target server
	 * @param args The args of the message
	 */
	public SendToServer<T extends Array<unknown>>(jobId: string, ...args: T) {
		this.event.SendToServer(jobId, { data: [...args] });
	}

	/**
	 * Sends an event to the specified player (if they're in any of the game's servers)
	 * @param userId The userId of the target player
	 * @param args The args
	 */
	public SendToPlayer<T extends Array<unknown>>(userId: number, ...args: T) {
		const player = Players.GetPlayerByUserId(userId);
		// If the player exists in this instance, just send it straight to them.
		if (player) {
			this.instance.SendToPlayer(player, ...args);
		} else {
			this.event.SendToAllServers({ data: [...args], targetId: userId });
		}
	}

	/**
	 * Sends an event to all the specified players (if they're in any of the game's servers)
	 * @param userIds The list of user ids to send this message to
	 * @param args The args of the message
	 */
	public SendToPlayers<T extends Array<unknown>>(userIds: Array<number>, ...args: T) {
		// Check to see if any of these users are in this server first, and handle accordingly.
		for (const targetId of userIds) {
			const player = Players.GetPlayerByUserId(targetId);
			if (player) {
				this.instance.SendToPlayer(player, ...args);
				userIds.remove(targetId);
			}
		}

		if (userIds.length > 0) {
			this.event.SendToAllServers({ data: [...args], targetIds: userIds });
		}
	}
}
