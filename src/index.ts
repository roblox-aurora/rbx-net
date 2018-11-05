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
    export type version_t = { number: number, date: number, tag?: string };
    const VERSION: version_t = {
        number: 1,
        date: 181031,
        tag: 'modremote-ts-alpha'
    };

    type value_t = string | number | boolean | Function | undefined;
    type table_t = Object | value_t[];
    type lua_type = table_t | value_t;

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
     * Networking for the Server
     * (Note: Will throw errors if used on client!)
     */
    export namespace Server {
        export class Event extends MRemoteEvent {


            public get Instance() {
                return this._instance;
            }

            public get Event() {
                return this._instance.OnServerEvent;
            }

            public Connect(callback: (...args: unknown[]) => void) {
                this.Event.Connect(callback);
            }

            public SendToAllPlayers(...args: unknown[]) {
                this._instance.FireAllClients(...args);
            }

            public SendToPlayer(player: Player, ...args: unknown[]) {
                this._instance.FireClient(player, ...args);
            }

            public SendToPlayers(players: Player[], ...args: unknown[]) {
                players.forEach(player => this.SendToPlayer(player, ...args));
            }

            constructor(name: string) {
                super(name);
                assert(!IS_CLIENT, "Cannot create a Net.ServerEvent on the Client!");

                if (!initialized)
                    init();
            }
        }

        export class Function extends MRemoteFunction {
            public get ClientCache() {
                let cache = this._instance.FindFirstChild("Cache") as NumberValue;
                if (cache)
                    return cache.Value;
                else
                    return 0;
            }

            public get Callback(): Callback {
                return this._instance.OnServerInvoke;
            }

            public set Callback(func: Callback) {
                this._instance.OnServerInvoke = func;
            }

            public get Instance() {
                return this._instance;
            }

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

            public async CallPlayerAsync(player: Player, ...args: lua_type[]): Promise<lua_type> {
                return this.CallPlayer(player, ...args);
            }

            public CallPlayer(player: Player, ...args: lua_type[]): lua_type {
                return this._instance.InvokeClient(player, ...args);
            }

            constructor(name: string) {
                super(name);
                assert(!IS_CLIENT, "Cannot create a Net.ServerFunction on the Client!");

                if (!initialized)
                    init();
            }
        }
    }

    /**
     * Networking for the Client
     * (Note: Will throw errors if used on server!)
     */
    export namespace Client {
        export class Event extends MRemoteEvent {

            public get Instance() {
                return this._instance;
            }

            public get Event() {
                return this._instance.OnClientEvent;
            }

            public Connect(callback: (...args: unknown[]) => void) {
                this.Event.Connect(callback);
            }

            public SendToServer(...args: unknown[]) {
                this._instance.FireServer(...args);
            }

            constructor(name: string) {
                super(name);
                assert(IS_CLIENT, "Cannot create a Net.ClientEvent on the Server!");

                if (!initialized)
                    init();
            }
        }

        export class Function extends MRemoteFunction {
            private _lastPing = -1;
            private _cached : any = [];

            public get Callback(): Callback {
                return this._instance.OnClientInvoke;
            }

            public set Callback(func: Callback) {
                this._instance.OnClientInvoke = func;
            }

            public get Instance() {
                return this._instance;
            }

            public get Cache() {
                let cache = this._instance.FindFirstChild("Cache") as NumberValue;
                if (cache)
                    return cache.Value;
                else
                    return 0;
            }


            public CallServer(...args: any[]): lua_type {
                if (this._lastPing < (os.time() + this.Cache))
                {
                    let results = [this._instance.InvokeServer(...args)];
                    this._cached = results;

                    this._lastPing = os.time();
                    return [...results];
                }
                else
                    return [...this._cached];
            }

            public async CallServerAsync(...args: lua_type[]): Promise<lua_type> {
                return this.CallServer(...args);
            }

            constructor(name: string) {
                super(name);
                assert(IS_CLIENT, "Cannot create a Net.ClientFunction on the Server!");
            }
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
    export function CreateFunction(name: string): Server.Function {
        if (!initialized)
            init();

        if (IS_SERVER)
            return new Server.Function(name);
        else
            throw "Net.createFunction can only be used on the server!";
    }

    /**
 * Create an event
 * @param name The name of the event
 * (Must be created on server)
 */
    export function CreateEvent(name: string): Server.Event {
        if (!initialized)
            init();

        if (IS_SERVER)
            return new Server.Event(name);
        else
            throw "Net.createFunction can only be used on the server!";
    }

    export function Version(): [number, number, string] {
        let { number, date, tag } = VERSION;
        return [number, date, tag || ''];
    }

    export function GetClientEventAsync(name: string): Promise<Client.Event> {
        return new Promise((resolve, reject) => {
            if (MRemoteEvent.Exists(name)) {
                let newFunc = new Client.Event(name);
                resolve(newFunc);
            }
            else {
                reject("Could not find Client Event: " + name + " (did you create it on the server?)");
            }
        });
    }

    export function GetClientFunction(name: string) : Client.Function | undefined
    {
        if (MRemoteFunction.Exists(name))
            return new Client.Function(name);
        else
            return undefined;       
    }

    export function GetServerEventAsync(name: string): Promise<Server.Event> {
        return new Promise((resolve, reject) => {
            if (MRemoteEvent.Exists(name)) {
                let newFunc = new Server.Event(name);
                resolve(newFunc);
            }
            else {
                reject("Could not find Server Event: " + name + " (did you create it on the server?)");
            }
        });
    }

    export function GetClientFunctionAsync(name: string): Promise<Client.Function> {
        return new Promise((resolve, reject) => {
            if (MRemoteFunction.Exists(name)) {
                let newFunc = new Client.Function(name);
                resolve(newFunc);
            }
            else {
                reject("Could not find Client Function: " + name + " (did you create it on the server?)");
            }
        });
    }

    export function GetServerFunctionAsync(name: string): Promise<Server.Function> {
        return new Promise((resolve, reject) => {
            if (MRemoteFunction.Exists(name)) {
                let newFunc = new Server.Function(name);
                resolve(newFunc);
            }
            else {
                reject("Could not find Server Function: " + name + " (did you create it?)");
            }
        });
    }
}

export default Net;
export let Client = Net.Client;
export let Server = Net.Server;