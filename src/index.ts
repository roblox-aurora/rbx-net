let _exports = {}; // hack that fixes _exports for default
let runService = game.GetService('RunService');
let replicatedStorage = game.GetService("ReplicatedStorage");

const IS_CLIENT = runService.IsClient();
const IS_SERVER = runService.IsServer();
const IS_STUDIO = runService.IsStudio();

const REMOTES_FOLDER_NAME = "Remotes";
const FUNCTIONS_FOLDER_NAME = "Functions";
const EVENTS_FOLDER_NAME = "Events";

let remoteFolder: Folder, eventFolder: Folder, functionFolder: Folder;

remoteFolder = replicatedStorage.FindFirstChild(REMOTES_FOLDER_NAME) as Folder;

if (!remoteFolder) {
    remoteFolder = new Folder(replicatedStorage);
    remoteFolder.Name = REMOTES_FOLDER_NAME;
}

functionFolder = remoteFolder.FindFirstChild(FUNCTIONS_FOLDER_NAME) as Folder;
if (!functionFolder) {
    functionFolder = new Folder(remoteFolder);
    functionFolder.Name = FUNCTIONS_FOLDER_NAME;
}

eventFolder = remoteFolder.FindFirstChild(EVENTS_FOLDER_NAME) as Folder;
if (!eventFolder) {
    eventFolder = new Folder(remoteFolder);
    eventFolder.Name = EVENTS_FOLDER_NAME;
}

function eventExists(name: string)
{
    return eventFolder.FindFirstChild(name) !== undefined;
}

function functionExists(name: string)
{
    return functionFolder.FindFirstChild(name) !== undefined;
}

function createRemoteIfNotExist(type: "Function" | "Event", name: string)
{
    let folder : Folder;
    if (type === "Event")
        folder = eventFolder;
    else if (type === "Function")
        folder = functionFolder;
    else
        throw "Invalid type: " + type;

    let existing = folder.FindFirstChild(name) as RemoteFunction | RemoteEvent;
    if (existing)
        return existing;
    else
    {
        if (!IS_SERVER)
            throw "Creation of Events or Functions must be done on server!";

        let newb : RemoteEvent | RemoteFunction;

        if (type === "Event")
            newb = new RemoteEvent();
        else if (type === "Function")
            newb = new RemoteFunction();
        else return; // stfu

        newb.Name = name;
        newb.Parent = folder;
        return newb;
    }
}

type NetworkSerializable = string | boolean | number | undefined | Instance | {[name: string]: NetworkSerializable}
type NetworkSerializableReturnValue = NetworkSerializable[] | NetworkSerializable; 
type NetworkSerializableArgs = Array<NetworkSerializable>;

export abstract class __FunctionBase {
    private _name: string;
    protected _instance: RemoteFunction;

    public get Name() {
        return this._name;
    }

    /**
     * @internal
     */
    constructor(name: string) {
        this._instance = createRemoteIfNotExist("Function", name) as RemoteFunction;
        this._name = name;
    }
}

export abstract class __EventBase {
    private _name: string;
    protected _instance: RemoteEvent;

    public get Name() {
        return this._name;
    }

    /**
     * @internal
     */
    constructor(name: string) {
        this._instance = createRemoteIfNotExist("Event", name) as RemoteEvent;

        this._name = name;
    }
}




/**
 * Typescript Networking Library for ROBLOX
 */
export namespace Net {
    interface version_t { number: number; date: number; tag?: string }

    /**
     * Version information
     * @internal
     */
    export const VERSION: version_t = {
        number: 0.22,
        date: 181106,
        tag: 'alpha'
    };

    /**
     * Get the version as a string
     */
    function getVersion() {
        return `v${VERSION.number} (${VERSION.tag || 'release'})`;
    }

    /**
     * An event on the server
     */
    export class ServerEvent extends __EventBase {

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
        public Connect<T extends NetworkSerializableArgs>(callback: (...args: T) => void) {
            this.Event.Connect(callback as any);
        }

        /**
         * Sends the specified arguments to all players
         * @param args The arguments to send to the players
         */
        public SendToAllPlayers<T extends NetworkSerializableArgs>(...args: T) {
            this._instance.FireAllClients(...args);
        }

        /**
         * Sends the specified arguments to a specified player
         * @param player The player
         * @param args The arguments to send to the player
         */
        public SendToPlayer<T extends NetworkSerializableArgs>(player: Player, ...args: T) {
            this._instance.FireClient(player, ...args);
        }

        /**
         * Sends the specified argumetns to the specified list of players
         * @param players The players
         * @param args The arugments to send to these players
         */
        public SendToPlayers<T extends NetworkSerializableArgs>(players: Player[], ...args: T) {
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
        }
    }

    /**
     * A function on the server
     */
    export class ServerFunction extends __FunctionBase {

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
        public async CallPlayerAsync<T extends NetworkSerializableArgs>(player: Player, ...args: T): Promise<NetworkSerializableReturnValue> {
            return this._instance.InvokeClient(player, ...args) as any;
        }

        /**
         * Creates a new instance of a server function (Will also create the corresponding remote if it does not exist!)
         * @param name The name of this server function
         * @throws If not created on server
         */
        constructor(name: string) {
            super(name);
            assert(!IS_CLIENT, "Cannot create a Net.ServerFunction on the Client!");
        }
    }


    /**
     * An event on the client
     */
    export class ClientEvent extends __EventBase {

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
        public Connect<T extends NetworkSerializableArgs>(callback: (...args: T) => void) {
            this.Event.Connect(callback as any);
        }

        /**
         * Sends the specified arguments to the server
         * @param args The arguments to send to the server
         */
        public SendToServer<T extends NetworkSerializableArgs>(...args: T) {
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
            assert(eventExists(name), `The specified event '${name}' does not exist!`);
        }
    }

    /**
     * A function on the client
     */
    export class ClientFunction extends __FunctionBase {
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
        public CallServer<T extends NetworkSerializableArgs>(...args: T): NetworkSerializableReturnValue {
            if (this._lastPing < (os.time() + this.Cache)) {
                let results = [this._instance.InvokeServer(...args)];
                this._cached = results;

                this._lastPing = os.time();
                return [...results] as any;
            }
            else
                return [...this._cached] as any;
        }

        /**
         * Call the server with the specified arguments asynchronously
         * @param args The args to call the server with
         * @async Will return a promise
         */
        public async CallServerAsync<T extends NetworkSerializableArgs>(...args: T): Promise<NetworkSerializableReturnValue> {
            return this.CallServer(...args);
        }

        constructor(name: string) {
            super(name);
            assert(IS_CLIENT, "Cannot create a Net.ClientFunction on the Server!");
            assert(functionExists(name), `The specified function '${name}' does not exist!`);
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
        if (IS_SERVER)
            return new ServerEvent(name);
        else
            throw "Net.createFunction can only be used on the server!";
    }

    export function GetClientEventAsync(name: string): Promise<ClientEvent> {
        return new Promise((resolve, reject) => {
            if (eventExists(name)) {
                let newFunc = new ClientEvent(name);
                resolve(newFunc);
            }
            else {
                reject("Could not find Client Event: " + name + " (did you create it on the server?)");
            }
        });
    }

    export function GetClientFunction(name: string): ClientFunction | undefined {
        if (functionExists(name))
            return new ClientFunction(name);
        else
            return undefined;
    }

    export function GetServerEventAsync(name: string): Promise<ServerEvent> {
        return new Promise((resolve, reject) => {
            if (eventExists(name)) {
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
            if (functionExists(name)) {
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
            if (functionExists(name)) {
                let newFunc = new ServerFunction(name);
                resolve(newFunc);
            }
            else {
                reject("Could not find Server Function: " + name + " (did you create it?)");
            }
        });
	}
	
	/**
	 * Function that allows using class methods as a callback/event handling function.
	 * Will also pass any extra arguments to the event handler function
	 * 
	 * 	cosnt bound = bind(this.method, this)
	 * 
	 * is equivalent to
	 * 
```lua
	local bound = function(...) self.method(self, ...); end
```
	 * 
	 * Example usage
	 * 
	 * 	class MyClass {
	 * 		private someEvent: Net.ServerEvent; 
	 * 		
	 * 		constructor() {
	 * 			this.someEvent = new Net.ServerEvent("SomeEvent");
	 * 			this.someEvent.Connect(
	 * 				Net.bind(this.onSomeEvent, this)
	 * 			);
	 * 		}
	 * 		
	 * 		private onSomeEvent() {
	 * 			print("Do the event!");
	 * 		}
	 * 	}
	 * 
	 * @param func The 
	 * @param thisArg The instance to call
	 * @param args 
	 */
	export function bind<T extends Array<any>, U>(func: (...args: T) => U, thisArg: any, ...args: Array<any>) {
		return (...args2: T) => {
			const args3 = [
				thisArg,
				...args,
				...args2,
			];
	
			(func as any)(thisArg, ...args3);
		};
	}

    if (IS_STUDIO)
        print("[rbx-net] Loaded rbx-net", getVersion());
}

export default Net;