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

    const VERSION: version_t = {
        number: 1,
        date: 181031,
        tag: 'modremote-ts-alpha'
    };

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


    export class ServerEvent extends MRemoteEvent {


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

    export class ServerFunction extends MRemoteFunction {
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

        public async CallPlayerAsync(player: Player, ...args: any[]): Promise<any> {
            return this.CallPlayer(player, ...args);
        }

        public CallPlayer(player: Player, ...args: any[]): any {
            return this._instance.InvokeClient(player, ...args);
        }

        constructor(name: string) {
            super(name);
            assert(!IS_CLIENT, "Cannot create a Net.ServerFunction on the Client!");

            if (!initialized)
                init();
        }
    }


    /**
     * Networking for the Client
     * (Note: Will throw errors if used on server!)
     */

    export class ClientEvent extends MRemoteEvent {

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

    export class ClientFunction extends MRemoteFunction {
        private _lastPing = -1;
        private _cached: any = [];

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

        public async CallServerAsync(...args: any[]): Promise<any> {
            return this.CallServer(...args);
        }

        constructor(name: string) {
            super(name);
            assert(IS_CLIENT, "Cannot create a Net.ClientFunction on the Server!");
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

    export function Version(): [number, number, string] {
        let { number, date, tag } = VERSION;
        return [number, date, tag || ''];
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