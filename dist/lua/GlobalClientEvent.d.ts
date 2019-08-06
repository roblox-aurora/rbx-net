/// <reference types="@rbxts/types" />
/**
 * Client counter-part to GlobalServerEvent
 */
export default class NetGlobalClientEvent {
    private readonly instance;
    constructor(name: string);
    /**
     * Connect a function to fire when the event is invoked by the client
     * @param callback The function fired when the event is invoked by the client
     */
    Connect<T extends Array<any>>(callback: (...args: T) => void): void;
}
