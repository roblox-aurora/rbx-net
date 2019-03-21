import { ServerTickFunctions, isLuaTable } from "./internal";
import MockMessagingService from "./MockMessagingService";

const MessagingService = game.GetService("MessagingService");
const Players = game.GetService("Players");
const IS_STUDIO = game.GetService("RunService").IsStudio();

interface IQueuedMessage {
	Name: string;
	Data: unknown;
}

export interface ISubscriptionMessage {
	Data: unknown;
	Sent: number;
}

interface IJobData {
	JobId: string;
	InnerData: string;
}

export interface ISubscriptionJobIdMessage extends ISubscriptionMessage {
	Data: IJobData;
}

/**
 * Checks if a value matches that of a subscription message
 * @param value The value
 */
export function isSubscriptionMessage(value: unknown): value is ISubscriptionMessage {
	if (isLuaTable(value)) {
		const hasData = value.has("Data");
		return hasData;
	} else {
		return false;
	}
}

function isJobTargetMessage(value: unknown): value is ISubscriptionJobIdMessage {
	if (isSubscriptionMessage(value)) {
		if (isLuaTable(value.Data)) {
			return value.Data.has("jobId");
		}
	}

	return false;
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
			MessagingService.PublishAsync(message.Name, message.Data);
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
	public SendToAllServers(message: unknown) {
		const limit = NetGlobalEvent.GetMessageLimit();
		if (globalEventMessageCounter >= limit) {
			warn(`[rbx-net] Exceeded message limit of ${limit}, adding to queue...`);
			globalMessageQueue.push({ Name: this.name, Data: message });
		} else {
			globalEventMessageCounter++;

			// Since this yields
			Promise.spawn(() => {
				((IS_STUDIO && MockMessagingService) || MessagingService).PublishAsync(this.name, message);
			});
		}
	}

	/**
	 * Connects a function to a global event
	 * @param handler The message handler
	 */
	public Connect(handler: (message: unknown, time: number) => void) {
		const limit = NetGlobalEvent.GetSubscriptionLimit();
		if (globalSubscriptionCounter >= limit) {
			error(`[rbx-net] Exceeded Subscription limit of ${limit}!`);
		}

		globalSubscriptionCounter++;
		return ((IS_STUDIO && MockMessagingService) || MessagingService).SubscribeAsync(
			this.name,
			(recieved: ISubscriptionMessage) => {
				const { Sent } = recieved;

				if (isJobTargetMessage(recieved)) {
					const { Data } = recieved;

					if (game.JobId === Data.JobId) {
						handler(Data.InnerData, Sent);
					}
				} else {
					handler(recieved.Data, Sent);
				}
			},
		);
	}
}

ServerTickFunctions.push(processMessageQueue);
