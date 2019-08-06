/// <reference types="@rbxts/types" />
/**
 * An event on the client
 * @rbxts client
 */
export default class NetClientEvent implements IClientNetEvent {
    /** @internal */
    private instance;
    /**
     * Create a new instance of the ClientEvent
     * @param name The name of the client event
     * @throws If created on server, or does not exist.
     */
    constructor(name: string);
    static WaitFor(name: string): Promise<NetClientEvent>;
    /**
     * The RemoteEvent instance
     */
    getInstance(): RemoteEvent;
    /**
     * The RBXScriptConnection
     */
    getEvent(): RBXScriptSignal<(...arguments: unknown[]) => void, true>;
    /**
     * Connect a function to fire when the event is invoked by the client
     * @param callback The function fired when the event is invoked by the client
     */
    Connect<T extends Array<any>>(callback: (...args: T) => void): RBXScriptConnection;
    /**
     * Sends the specified arguments to the server
     * @param args The arguments to send to the server
     */
    SendToServer<T extends Array<any>>(...args: T): void;
}
