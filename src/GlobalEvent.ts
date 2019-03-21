import { ServerTickFunctions, isLuaTable } from "./internal";

const MessagingService = game.GetService("MessagingService");
const Players = game.GetService("Players");

interface IQueuedMessage {
	name: string;
	message: unknown;
}

export interface IServerMessage {
	jobId: string;
	message: unknown;
}

function isJobTargetMessage(value: unknown): value is IServerMessage {
	if (isLuaTable(value)) {
		const hasData = value.has("jobId");
		return !value.isEmpty() && (hasData && typeOf(value.get("jobId")) === "string");
	} else {
		return false;
	}
}

const globalMessageQueue = new Array<IQueuedMessage>();
let lastQueueTick = 0;
let globalEventMessageCounter = 0;
let globalSubscriptionCounter = 0;

function processMessageQueue() {
	if (tick() >= lastQueueTick + 60) {
		globalEventMessageCounter = 0;
		globalSubscriptionCounter = 0;
		lastQueueTick = tick();

		while (globalMessageQueue.length > 0) {
			const message = globalMessageQueue.pop()!;
			MessagingService.PublishAsync(message.name, message.message);
			globalEventMessageCounter++;
		}

		if (globalEventMessageCounter >= NetGlobalEvent.GetMessageLimit()) {
			warn("[rbx-net] Too many messages are being sent, any further messages will be queued!");
		}
	}
}

/**
 * Message Size: 1kB
 * MessagesPerMin: 150 + 60 * NUMPLAYERS
 * MessagesPerTopicMin: 30M
 * MessagesPerUniversePerMin: 30M
 * SubsPerServer: 5 + 2 * numPlayers
 * SubsPerUniverse: 10K
 */

/**
 * An event that works across all servers
 * @see https://developer.roblox.com/api-reference/class/MessagingService for limits, etc.
 */
export default class NetGlobalEvent implements INetXMessageEvent {
	constructor(private name: string) {}

	/**
	 * Gets the message limit
	 */
	public static GetMessageLimit() {
		return 150 + 60 * Players.GetPlayers().length;
	}

	/**
	 * Gets the subscription limit
	 */
	public static GetSubscriptionLimit() {
		return 5 + 2 * Players.GetPlayers().length;
	}

	/**
	 * Sends a message to a specific server
	 * @param jobId The game.JobId of the target server
	 * @param message The message to send
	 */
	public SendToServer(jobId: string, message: unknown) {
		this.SendToAllServers({ jobId, message });
	}

	/**
	 * Sends a message to all servers
	 * @param message The message to send
	 */
	public SendToAllServers(message: unknown): void {
		const limit = NetGlobalEvent.GetMessageLimit();
		if (globalEventMessageCounter >= limit) {
			warn(`[rbx-net] Exceeded message limit of ${limit}, adding to queue...`);
			globalMessageQueue.push({ name: this.name, message });
		} else {
			globalEventMessageCounter++;
			MessagingService.PublishAsync(this.name, message);
		}
	}

	/**
	 * Connects a function to a global event
	 * @param handler The message handler
	 */
	public Connect(handler: (message: unknown) => void) {
		const limit = NetGlobalEvent.GetSubscriptionLimit();
		if (globalSubscriptionCounter >= limit) {
			error(`[rbx-net] Exceeded Subscription limit of ${limit}!`);
		}

		globalSubscriptionCounter++;
		return MessagingService.SubscribeAsync(this.name, (recieved: unknown) => {
			if (isJobTargetMessage(recieved)) {
				if (game.JobId === recieved.jobId) {
					handler(recieved.message);
				}
			} else {
				handler(recieved);
			}
		});
	}
}

ServerTickFunctions.push(processMessageQueue);
