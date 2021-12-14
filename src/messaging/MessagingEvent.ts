import { isLuaTable, ServerTickFunctions } from "../internal";

// const MessagingService = game.GetService("MessagingService");
import MessagingService from "./MessagingService";
const Players = game.GetService("Players");
const IS_STUDIO = game.GetService("RunService").IsStudio();

declare global {
	interface MessagingService extends Instance {
		SubscribeAsync(name: string, callback: (data: ISubscriptionMessage) => void): RBXScriptConnection;
	}
}

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
	InnerData: unknown;
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

		while (globalMessageQueue.size() > 0) {
			const message = globalMessageQueue.pop()!;
			MessagingService.PublishAsync(message.Name, message.Data);
			globalEventMessageCounter++;
		}

		if (globalEventMessageCounter >= MessagingEvent.GetMessageLimit()) {
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

type JobIdMessage<TMessage> = { jobId: string; message: TMessage };

/**
 * An event that works across all servers
 * @see https://developer.roblox.com/api-reference/class/MessagingService for limits, etc.
 */
export default class MessagingEvent<TMessage extends unknown = unknown> {
	constructor(private name: string) {}

	/**
	 * Gets the message limit
	 */
	public static GetMessageLimit() {
		return 150 + 60 * Players.GetPlayers().size();
	}

	/**
	 * Gets the subscription limit
	 */
	public static GetSubscriptionLimit() {
		return 5 + 2 * Players.GetPlayers().size();
	}

	/**
	 * Internal method for sending a message to all servers.
	 *
	 * @param data The data to send
	 */
	private sendToAllServersOrQueue(data: TMessage | JobIdMessage<TMessage>) {
		const limit = MessagingEvent.GetMessageLimit();
		if (globalEventMessageCounter >= limit) {
			warn(`[rbx-net] Exceeded message limit of ${limit}, adding to queue...`);
			globalMessageQueue.push({ Name: this.name, Data: data });
		} else {
			globalEventMessageCounter++;

			// Since this yields
			MessagingService.PublishAsync(this.name, data);
		}
	}

	/**
	 * Sends a message to a specific server
	 * @param jobId The game.JobId of the target server
	 * @param message The message to send
	 */
	public SendToServer(jobId: string, message: TMessage) {
		this.sendToAllServersOrQueue({ jobId, message });
	}

	/**
	 * Sends a message to all servers
	 * @param message The message to send
	 */
	public SendToAllServers(message: TMessage) {
		this.sendToAllServersOrQueue(message);
	}

	/**
	 * Connects a function to a global event
	 * @param handler The message handler
	 */
	public Connect(handler: (message: TMessage, time: number) => void) {
		const limit = MessagingEvent.GetSubscriptionLimit();
		if (globalSubscriptionCounter >= limit) {
			error(`[rbx-net] Exceeded Subscription limit of ${limit}!`);
		}

		globalSubscriptionCounter++;
		return MessagingService.SubscribeAsync(this.name, (message) => {
			const recieved = message;
			const { Sent } = recieved;

			if (isJobTargetMessage(recieved)) {
				const { Data } = recieved;

				if (game.JobId === Data.JobId) {
					handler(Data.InnerData as TMessage, Sent);
				}
			} else {
				handler(recieved.Data as TMessage, Sent);
			}
		});
	}
}

ServerTickFunctions.push(processMessageQueue);
