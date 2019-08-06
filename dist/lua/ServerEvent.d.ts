/// <reference types="@rbxts/types" />
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
    constructor(name: string);
    /**
     * The RemoteEvent instance
     */
    getInstance(): RemoteEvent;
    /**
     * The RBXScriptSignal for this RemoteEvent
     */
    getEvent(): RBXScriptSignal<(player: Player, ...arguments: unknown[]) => void, false>;
    /**
     * Connect a fucntion to fire when the event is invoked by the client
     * @param callback The function fired when the event is invoked by the client
     */
    Connect<T extends Array<unknown>>(callback: (sourcePlayer: Player, ...args: T) => void): RBXScriptConnection;
    /**
     * Sends the specified arguments to all players
     * @param args The arguments to send to the players
     */
    SendToAllPlayers<T extends Array<any>>(...args: T): void;
    /**
     * Will send this message to all players except specified players
     * @param blacklist The blacklist
     * @param args The arguments
     */
    SendToAllPlayersExcept<T extends Array<any>>(blacklist: Player | Array<Player>, ...args: T): void;
    /**
     * Sends the specified arguments to a specified player
     * @param player The player
     * @param args The arguments to send to the player
     */
    SendToPlayer<T extends Array<any>>(player: Player, ...args: T): void;
    /**
     * Sends the specified argumetns to the specified list of players
     * @param players The players
     * @param args The arugments to send to these players
     */
    SendToPlayers<T extends Array<any>>(players: Array<Player>, ...args: T): void;
}
