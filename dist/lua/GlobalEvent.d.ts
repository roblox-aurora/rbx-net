/// <reference types="@rbxts/types" />
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
export declare function isSubscriptionMessage(value: unknown): value is ISubscriptionMessage;
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
    private name;
    constructor(name: string);
    /**
     * Gets the message limit
     */
    static GetMessageLimit(): number;
    /**
     * Gets the subscription limit
     */
    static GetSubscriptionLimit(): number;
    /**
     * Sends a message to a specific server
     * @param jobId The game.JobId of the target server
     * @param message The message to send
     */
    SendToServer(jobId: string, message: unknown): void;
    /**
     * Sends a message to all servers
     * @param message The message to send
     */
    SendToAllServers(message: unknown): void;
    /**
     * Connects a function to a global event
     * @param handler The message handler
     */
    Connect(handler: (message: unknown, time: number) => void): RBXScriptConnection;
}
export {};
