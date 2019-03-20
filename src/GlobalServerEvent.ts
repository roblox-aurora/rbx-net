import NetServerEvent from "ServerEvent";
import NetGlobalEvent from "GlobalEvent";
import { getGlobalRemote, IS_CLIENT } from "internal";
const Players = game.GetService("Players");

export interface IMessage {
	data: Array<unknown>;
	targetId?: number;
	targetIds?: Array<number>;
}

function isLuaTable(value: unknown): value is Map<unknown, unknown> {
	return typeIs(value, "table");
}

function isMessage(value: unknown): value is IMessage {
	if (isLuaTable(value)) {
		const hasData = value.has("data");
		return !value.isEmpty() && (hasData && typeOf(value.get("data")) === "table");
	} else {
		return false;
	}
}

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

	public SendToAllServers<T extends Array<unknown>>(...args: T) {
		this.event.SendToAllServers({ data: [...args] });
	}

	public SendToPlayer<T extends Array<unknown>>(userId: number, ...args: T) {
		this.event.SendToAllServers({ data: [...args], targetId: userId });
	}

	public SendToPlayers<T extends Array<unknown>>(userIds: Array<number>, ...args: T) {
		this.event.SendToAllServers({ data: [...args], targetIds: userIds });
	}
}
