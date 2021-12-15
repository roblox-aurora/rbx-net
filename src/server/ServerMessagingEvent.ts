import ExperienceBroadcastEvent, {
	isSubscriptionMessage,
	ISubscriptionMessage,
} from "../messaging/ExperienceBroadcastEvent";
import { getGlobalRemote, IS_CLIENT, isLuaTable } from "../internal";
import ServerEvent from "./ServerEvent";
const Players = game.GetService("Players");

export interface IMessage<TArgs> {
	InnerData: TArgs;
	TargetId?: number;
	TargetIds?: Array<number>;
}

export interface ISubscriptionTargetedMessage extends ISubscriptionMessage {
	Data: IMessage<any>;
}

function isTargetedSubscriptionMessage(value: unknown): value is ISubscriptionTargetedMessage {
	if (isSubscriptionMessage(value)) {
		if (isLuaTable(value.Data)) {
			return value.Data.has("InnerData");
		}
	}

	return false;
}

/**
 * Similar to a ServerEvent, but works across all servers.
 */
export default class ServerMessagingEvent<TArgs extends readonly unknown[] = unknown[]> {
	private readonly instance: ServerEvent<[], TArgs>;
	private readonly event: ExperienceBroadcastEvent;
	private readonly eventHandler: RBXScriptConnection;

	constructor(name: string) {
		this.instance = new ServerEvent(getGlobalRemote(name));
		this.event = new ExperienceBroadcastEvent(name);
		assert(!IS_CLIENT, "Cannot create a Net.GlobalServerEvent on the Client!");

		this.eventHandler = this.event.Connect((message) => {
			if (isTargetedSubscriptionMessage(message)) {
				this.recievedMessage(message.Data);
			} else {
				warn(`[rbx-net] Recieved malformed message for ServerGameEvent: ${name}`);
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

	private recievedMessage(message: IMessage<TArgs>) {
		if (message.TargetIds) {
			const players = this.getPlayersMatchingId(message.TargetIds);
			if (players) {
				this.instance.SendToPlayers(players as Array<Player>, ...message.InnerData);
			}
		} else if (message.TargetId !== undefined) {
			const player = this.getPlayersMatchingId(message.TargetId);
			if (player) {
				this.instance.SendToPlayer(player as Player, ...message.InnerData);
			}
		} else {
			this.instance.SendToAllPlayers(...message.InnerData);
		}
	}

	/**
	 * Disconnects this event handler
	 *
	 * **NOTE**: Once disconnected, you will have to re-create this object to recieve the messages again.
	 */
	public Disconnect() {
		this.eventHandler.Disconnect();
	}

	/**
	 * SEnds an event to all servers in the game
	 * @param args The args of the message
	 */
	public SendToAllServers(...args: TArgs) {
		this.event.SendToAllServers({ data: [...args] });
	}

	/**
	 * Sends an event to the specified server
	 * @param jobId The game.JobId of the target server
	 * @param args The args of the message
	 */
	public SendToServer(jobId: string, ...args: TArgs) {
		this.event.SendToServer(jobId, { data: [...args] });
	}

	/**
	 * Sends an event to the specified player (if they're in any of the game's servers)
	 * @param userId The userId of the target player
	 * @param args The args
	 */
	public SendToPlayer(userId: number, ...args: TArgs) {
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
	public SendToPlayers(userIds: Array<number>, ...args: TArgs) {
		// Check to see if any of these users are in this server first, and handle accordingly.
		for (const targetId of userIds) {
			const player = Players.GetPlayerByUserId(targetId);
			if (player) {
				this.instance.SendToPlayer(player, ...args);
				userIds.remove(targetId);
			}
		}

		if (userIds.size() > 0) {
			this.event.SendToAllServers({ data: [...args], targetIds: userIds });
		}
	}
}
