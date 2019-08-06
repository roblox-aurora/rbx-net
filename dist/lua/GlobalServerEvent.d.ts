/// <reference types="@rbxts/types" />
import { ISubscriptionMessage } from "./GlobalEvent";
export interface IMessage {
    InnerData: Array<unknown>;
    TargetId?: number;
    TargetIds?: Array<number>;
}
export interface ISubscriptionTargetedMessage extends ISubscriptionMessage {
    Data: IMessage;
}
/**
 * Similar to a ServerEvent, but works across all servers.
 */
export default class NetGlobalServerEvent implements INetXServerEvent {
    private readonly instance;
    private readonly event;
    private readonly eventHandler;
    constructor(name: string);
    private getPlayersMatchingId;
    private recievedMessage;
    /**
     * Disconnects this event handler
     *
     * **NOTE**: Once disconnected, you will have to re-create this object to recieve the messages again.
     */
    Disconnect(): void;
    /**
     * SEnds an event to all servers in the game
     * @param args The args of the message
     */
    SendToAllServers<T extends Array<unknown>>(...args: T): void;
    /**
     * Sends an event to the specified server
     * @param jobId The game.JobId of the target server
     * @param args The args of the message
     */
    SendToServer<T extends Array<unknown>>(jobId: string, ...args: T): void;
    /**
     * Sends an event to the specified player (if they're in any of the game's servers)
     * @param userId The userId of the target player
     * @param args The args
     */
    SendToPlayer<T extends Array<unknown>>(userId: number, ...args: T): void;
    /**
     * Sends an event to all the specified players (if they're in any of the game's servers)
     * @param userIds The list of user ids to send this message to
     * @param args The args of the message
     */
    SendToPlayers<T extends Array<unknown>>(userIds: Array<number>, ...args: T): void;
}
