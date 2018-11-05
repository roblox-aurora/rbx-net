/**
 * rbx-net, (alias: modremote-ts)
 */

let _exports = {}; // hack that fixes _exports for default
let runService = game.GetService('RunService');
const IS_CLIENT = runService.IsClient();
const IS_SERVER = runService.IsServer();

/**
 * Typescript Networking Library for ROBLOX
 */
export namespace Net {
    interface version_t { number: number; date: number; tag?: string }

    /**
     * Version information
     */
    export const VERSION: version_t = {
        number: 0.12,
        date: 181106,
        tag: 'alpha'
    };

    /**
     * Get the version as a string
     */
    export function GetVersion() {
        return `v${VERSION.number} (${VERSION.tag || 'release'})`;
    }

    const REMOTES_FOLDER_NAME = "Remotes";
    let remoteFolder: Folder, eventFolder: Folder, functionFolder: Folder;
    let initialized: boolean = false;

    class MRemoteEvent {
        private _name: string;
        protected _instance: RemoteEvent;

        public get Name() {
            return this._name;
        }

        public static Exists(name: string) {
            if (!initialized) init();

            return eventFolder.FindFirstChild(name) as boolean;
        }

        constructor(name: string) {
            let existing = eventFolder.FindFirstChild(name) as RemoteEvent;
            if (existing)
                this._instance = existing;
            else {
                if (!IS_SERVER)
                    throw "Remote Event must be created on server first!";

                let newFunction = new RemoteEvent();
                newFunction.Name = name;
                newFunction.Parent = eventFolder;
                this._instance = newFunction;
            }

            this._name = name;
        }
    }

    /**
     * The wrapper for the RemoteFunction instance
     */
    class MRemoteFunction {
        private _name: string;
        protected _instance: RemoteFunction;

        public get Name() {
            return this._name;
        }

        public static Exists(name: string) {
            if (!initialized) init();

            return functionFolder.FindFirstChild(name) as boolean;
        }

        constructor(name: string) {
            let existing = functionFolder.FindFirstChild(name) as RemoteFunction;
            if (existing)
                this._instance = existing;
            else {
                if (!IS_SERVER)
                    throw "Remote Function must be created on server first!";

                let newFunction = new RemoteFunction();
                newFunction.Name = name;
                newFunction.Parent = functionFolder;
                this._instance = newFunction;
            }

            this._name = name;
        }
    }


    /**
     * An event on the server
     */
    export class ServerEvent extends MRemoteEvent {

        /**
         * The RemoteEvent instance
         */
        public get Instance() {
            return this._instance;
        }

        /**
         * The RBXScriptSignal for this RemoteEvent
         */
        public get Event() {
            return this._instance.OnServerEvent;
        }

        /**
         * Connect a fucntion to fire when the event is invoked by the client
         * @param callback The function fired when the event is invoked by the client
         */
        public Connect(callback: (...args: unknown[]) => void) {
            this.Event.Connect(callback);
        }

        /**
         * Sends the specified arguments to all players
         * @param args The arguments to send to the players
         */
        public SendToAllPlayers(...args: unknown[]) {
            this._instance.FireAllClients(...args);
        }

        /**
         * Sends the specified arguments to a specified player
         * @param player The player
         * @param args The arguments to send to the player
         */
        public SendToPlayer(player: Player, ...args: unknown[]) {
            this._instance.FireClient(player, ...args);
        }

        /**
         * Sends the specified argumetns to the specified list of players
         * @param players The players
         * @param args The arugments to send to these players
         */
        public SendToPlayers(players: Player[], ...args: unknown[]) {
            players.forEach(player => this.SendToPlayer(player, ...args));
        }

        /**
         * Creates a new instance of a server event (Will also create the corresponding remote if it does not exist!)
         * @param name The name of this server event
         * @throws If not created on server
         */
        constructor(name: string) {
            super(name);
            assert(!IS_CLIENT, "Cannot create a Net.ServerEvent on the Client!");

            if (!initialized)
                init();
        }
    }

    /**
     * A function on the server
     */
    export class ServerFunction extends MRemoteFunction {

        /**
         * The client cache in seconds
         */
        public get ClientCache() {
            let cache = this._instance.FindFirstChild("Cache") as NumberValue;
            if (cache)
                return cache.Value;
            else
                return 0;
        }

        /**
         * The callback function
         */
        public get Callback(): Callback {
            return this._instance.OnServerInvoke;
        }

        /**
         * Set the callback function when called by the client
         */
        public set Callback(func: Callback) {
            this._instance.OnServerInvoke = func;
        }

        /**
         * The RemoteFunction instance
         */
        public get Instance() {
            return this._instance;
        }

        /**
         * Sets a client cache timer in seconds
         * @param time seconds to cache on client
         */
        public set ClientCache(time: number) {
            let cache = this._instance.FindFirstChild("Cache") as NumberValue;
            if (!cache) {
                let cacheTimer = new NumberValue(this._instance);
                cacheTimer.Value = time;
                cacheTimer.Name = "Cache";
            }
            else {
                cache.Value = time;
            }
        }

        /**
         * Calls the player and returns a promise
         * @async returns Promise
         * @param player The player to call the function on
         * @param args The arguments to call the function with
         */
        public async CallPlayerAsync(player: Player, ...args: any[]): Promise<any> {
            return this._instance.InvokeClient(player, ...args);
        }

        /**
         * Creates a new instance of a server function (Will also create the corresponding remote if it does not exist!)
         * @param name The name of this server function
         * @throws If not created on server
         */
        constructor(name: string) {
            super(name);
            assert(!IS_CLIENT, "Cannot create a Net.ServerFunction on the Client!");

            if (!initialized)
                init();
        }
    }


    /**
     * An event on the client
     */
    export class ClientEvent extends MRemoteEvent {

        /**
         * The RemoteEvent instance
         */
        public get Instance() {
            return this._instance;
        }

        /**
         * The RBXScriptConnection
         */
        public get Event() {
            return this._instance.OnClientEvent;
        }

        /**
         * Connect a function to fire when the event is invoked by the client
         * @param callback The function fired when the event is invoked by the client
         */
        public Connect(callback: (...args: unknown[]) => void) {
            this.Event.Connect(callback);
        }

        /**
         * Sends the specified arguments to the server
         * @param args The arguments to send to the server
         */
        public SendToServer(...args: unknown[]) {
            this._instance.FireServer(...args);
        }

        /**
         * Create a new instance of the ClientEvent
         * @param name The name of the client event
         * @throws If created on server, or does not exist.
         */
        constructor(name: string) {
            super(name);
            assert(IS_CLIENT, "Cannot create a Net.ClientEvent on the Server!");
            assert(MRemoteEvent.Exists(name), `The specified event '${name}' does not exist!`);

            if (!initialized)
                init();
        }
    }

    /**
     * A function on the client
     */
    export class ClientFunction extends MRemoteFunction {
        private _lastPing = -1;
        private _cached: any = [];

        /**
         * The callback
         */
        public get Callback(): Callback {
            return this._instance.OnClientInvoke;
        }

        /**
        * Set the callback function when called by the server
        */
        public set Callback(func: Callback) {
            this._instance.OnClientInvoke = func;
        }

        /** 
         * The remoteFunction instance */
        public get Instance() {
            return this._instance;
        }

        /**
         * The client cache in seconds
         */
        public get Cache() {
            let cache = this._instance.FindFirstChild("Cache") as NumberValue;
            if (cache)
                return cache.Value;
            else
                return 0;
        }


        /**
         * Call the server with the specified arguments
         * @param args The arguments to call the server with
         * @returns the result of the call to the server
         */
        public CallServer(...args: any[]): any {
            if (this._lastPing < (os.time() + this.Cache)) {
                let results = [this._instance.InvokeServer(...args)];
                this._cached = results;

                this._lastPing = os.time();
                return [...results];
            }
            else
                return [...this._cached];
        }

        /**
         * Call the server with the specified arguments asynchronously
         * @param args The args to call the server with
         * @async Will return a promise
         */
        public async CallServerAsync(...args: any[]): Promise<any> {
            return this.CallServer(...args);
        }

        constructor(name: string) {
            super(name);
            assert(IS_CLIENT, "Cannot create a Net.ClientFunction on the Server!");
            assert(MRemoteFunction.Exists(name), `The specified function '${name}' does not exist!`);
        }
    }

    function init() {
        let replicatedStorage = game.GetService("ReplicatedStorage");
        remoteFolder = replicatedStorage.FindFirstChild(REMOTES_FOLDER_NAME) as Folder;

        // Check for remotes folder
        if (!remoteFolder) {
            remoteFolder = new Folder(replicatedStorage);
            remoteFolder.Name = REMOTES_FOLDER_NAME;
        }

        functionFolder = remoteFolder.FindFirstChild("Functions") as Folder;
        if (!functionFolder) {
            functionFolder = new Folder(remoteFolder);
            functionFolder.Name = "Functions";
        }

        eventFolder = remoteFolder.FindFirstChild("Events") as Folder;
        if (!eventFolder) {
            eventFolder = new Folder(remoteFolder);
            eventFolder.Name = "Events";
        }
    }

    export function IsClient() {
        return IS_CLIENT;
    }

    export function IsServer() {
        return IS_SERVER;
    }

    /**
     * Create a function
     * @param name The name of the function
     * (Must be created on server)
     */
    export function CreateFunction(name: string): ServerFunction {
        if (!initialized)
            init();

        if (IS_SERVER)
            return new ServerFunction(name);
        else
            throw "Net.createFunction can only be used on the server!";
    }

    /**
     * Create an event
     * @param name The name of the event
     * (Must be created on server)
     */
    export function CreateEvent(name: string): ServerEvent {
        if (!initialized)
            init();

        if (IS_SERVER)
            return new ServerEvent(name);
        else
            throw "Net.createFunction can only be used on the server!";
    }

    export function GetClientEventAsync(name: string): Promise<ClientEvent> {
        return new Promise((resolve, reject) => {
            if (MRemoteEvent.Exists(name)) {
                let newFunc = new ClientEvent(name);
                resolve(newFunc);
            }
            else {
                reject("Could not find Client Event: " + name + " (did you create it on the server?)");
            }
        });
    }

    export function GetClientFunction(name: string): ClientFunction | undefined {
        if (MRemoteFunction.Exists(name))
            return new ClientFunction(name);
        else
            return undefined;
    }

    export function GetServerEventAsync(name: string): Promise<ServerEvent> {
        return new Promise((resolve, reject) => {
            if (MRemoteEvent.Exists(name)) {
                let newFunc = new ServerEvent(name);
                resolve(newFunc);
            }
            else {
                reject("Could not find Server Event: " + name + " (did you create it on the server?)");
            }
        });
    }

    export function GetClientFunctionAsync(name: string): Promise<ClientFunction> {
        return new Promise((resolve, reject) => {
            if (MRemoteFunction.Exists(name)) {
                let newFunc = new ClientFunction(name);
                resolve(newFunc);
            }
            else {
                reject("Could not find Client Function: " + name + " (did you create it on the server?)");
            }
        });
    }

    export function GetServerFunctionAsync(name: string): Promise<ServerFunction> {
        return new Promise((resolve, reject) => {
            if (MRemoteFunction.Exists(name)) {
                let newFunc = new ServerFunction(name);
                resolve(newFunc);
            }
            else {
                reject("Could not find Server Function: " + name + " (did you create it?)");
            }
        });
    }
}

export default Net;