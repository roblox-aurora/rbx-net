// tslint:disable:variable-name
const _exports = {}; // hack that fixes _exports for default
// tslint:enable:variable-name

const runService = game.GetService("RunService");
const replicatedStorage = game.GetService("ReplicatedStorage");

const IS_CLIENT = runService.IsClient();
const IS_SERVER = runService.IsServer();
const IS_STUDIO = runService.IsStudio();

const REMOTES_FOLDER_NAME = "Remotes";
const FUNCTIONS_FOLDER_NAME = "Functions";
const EVENTS_FOLDER_NAME = "Events";

let remoteFolder: Folder;
let eventFolder: Folder;
let functionFolder: Folder;

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

function eventExists(name: string) {
	return eventFolder.FindFirstChild(name) !== undefined;
}

function functionExists(name: string) {
	return functionFolder.FindFirstChild(name) !== undefined;
}

function waitForEvent(name: string, timeOut: number): RemoteEvent | undefined {
	return eventFolder.WaitForChild(name, timeOut);
}

function waitForFunction(name: string, timeOut: number): RemoteFunction | undefined {
	return functionFolder.WaitForChild(name, timeOut);
}

function createRemoteIfNotExist(type: "Function" | "Event", name: string) {
	let folder: Folder;
	if (type === "Event") {
		folder = eventFolder;
	} else if (type === "Function") {
		folder = functionFolder;
	} else {
		throw "Invalid type: " + type;
	}

	const existing = folder.FindFirstChild(name) as RemoteFunction | RemoteEvent;
	if (existing) {
		return existing;
	} else {
		if (!IS_SERVER) {
			error("Creation of Events or Functions must be done on server!");
			throw "Creation of Events or Functions must be done on server!";
		}

		let newb: RemoteEvent | RemoteFunction;

		if (type === "Event") {
			newb = new RemoteEvent();
		} else if (type === "Function") {
			newb = new RemoteFunction();
		} else {
			return;
		} // stfu

		newb.Name = name;
		newb.Parent = folder;
		return newb;
	}
}

type NetworkSerializable = string | boolean | number | undefined
	| Instance | { [name: string]: NetworkSerializable };
type NetworkSerializableReturnValue = Array<NetworkSerializable> | NetworkSerializable;
type NetworkSerializableArgs = Array<NetworkSerializable>;

export abstract class FunctionBase {
	private name: string;
	protected instance: RemoteFunction;

	public get Name() {
		return this.name;
	}

	/**
	 * @internal
	 */
	constructor(name: string) {
		this.instance = createRemoteIfNotExist("Function", name) as RemoteFunction;
		this.name = name;
	}
}

export abstract class EventBase {
	private name: string;
	protected instance: RemoteEvent;

	public get Name() {
		return this.name;
	}

	/**
	 * @internal
	 */
	constructor(name: string) {
		this.instance = createRemoteIfNotExist("Event", name) as RemoteEvent;

		this.name = name;
	}
}

/**
 * Typescript Networking Library for ROBLOX
 */
export namespace Net {
	const MAX_CLIENT_WAITFORCHILD_TIMEOUT = 10;

	interface VersionType { number: number; date: number; tag?: string; }

	/**
	 * Version information
	 * @internal
	 */
	export const VERSION: VersionType = {
		number: 0.22,
		date: 181106,
		tag: "alpha",
	};

	/**
	 * Get the version as a string
	 */
	function getVersion() {
		return `v${VERSION.number} (${VERSION.tag || "release"})`;
	}

	/**
	 * An event on the server
	 */
	export class ServerEvent extends EventBase {

		/**
		 * Creates a new instance of a server event (Will also create the corresponding remote if it does not exist!)
		 * @param name The name of this server event
		 * @throws If not created on server
		 */
		constructor(name: string) {
			super(name);
			assert(!IS_CLIENT, "Cannot create a Net.ServerEvent on the Client!");
		}

		/**
		 * The RemoteEvent instance
		 */
		public get Instance() {
			return this.instance;
		}

		/**
		 * The RBXScriptSignal for this RemoteEvent
		 */
		public get Event() {
			return this.instance.OnServerEvent;
		}

		/**
		 * Connect a fucntion to fire when the event is invoked by the client
		 * @param callback The function fired when the event is invoked by the client
		 */
		public Connect<T extends NetworkSerializableArgs>(callback: (sourcePlayer: Player, ...args: T) => void) {
			this.Event.Connect(callback as any);
		}

		/**
		 * Sends the specified arguments to all players
		 * @param args The arguments to send to the players
		 */
		public SendToAllPlayers<T extends NetworkSerializableArgs>(...args: T) {
			this.instance.FireAllClients(...args);
		}

		/**
		 * Sends the specified arguments to a specified player
		 * @param player The player
		 * @param args The arguments to send to the player
		 */
		public SendToPlayer<T extends NetworkSerializableArgs>(player: Player, ...args: T) {
			this.instance.FireClient(player, ...args);
		}

		/**
		 * Sends the specified argumetns to the specified list of players
		 * @param players The players
		 * @param args The arugments to send to these players
		 */
		public SendToPlayers<T extends NetworkSerializableArgs>(players: Array<Player>, ...args: T) {
			for (const player of players) {
				this.SendToPlayer(player, ...args);
			}
		}
	}

	/**
	 * A function on the server
	 */
	export class ServerFunction extends FunctionBase {

		/**
		 * Creates a new instance of a server function (Will also create the corresponding remote if it does not exist!)
		 * @param name The name of this server function
		 * @throws If not created on server
		 */
		constructor(name: string) {
			super(name);
			assert(!IS_CLIENT, "Cannot create a Net.ServerFunction on the Client!");
		}

		/**
		 * The callback function
		 */
		public get Callback(): Callback {
			return this.instance.OnServerInvoke;
		}

		/**
		 * Set the callback function when called by the client
		 */
		public set Callback(func: Callback) {
			this.instance.OnServerInvoke = func;
		}

		/**
		 * The RemoteFunction instance
		 */
		public get Instance() {
			return this.instance;
		}

		/**
		 * The client cache in seconds
		 */
		public get ClientCache() {
			const cache = this.instance.FindFirstChild("Cache") as NumberValue;
			if (cache) {
				return cache.Value;
			} else {
				return 0;
			}
		}

		/**
		 * Sets a client cache timer in seconds
		 * @param time seconds to cache on client
		 */
		public set ClientCache(time: number) {
			const cache = this.instance.FindFirstChild("Cache") as NumberValue;
			if (!cache) {
				const cacheTimer = new NumberValue(this.instance);
				cacheTimer.Value = time;
				cacheTimer.Name = "Cache";
			} else {
				cache.Value = time;
			}
		}

		/**
		 * Calls the player and returns a promise
		 * @async returns Promise
		 * @param player The player to call the function on
		 * @param args The arguments to call the function with
		 */
		public async CallPlayerAsync<T extends NetworkSerializableArgs>(
			player: Player, ...args: T): Promise<NetworkSerializableReturnValue> {
			return this.instance.InvokeClient(player, ...args) as any;
		}

	}

	/**
	 * An event on the client
	 */
	export class ClientEvent extends EventBase {

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

		public static async WaitFor(name: string): Promise<Net.ClientEvent> {
			const fun: RemoteEvent | undefined = waitForEvent(name, MAX_CLIENT_WAITFORCHILD_TIMEOUT);
			if (!fun) {
				error("Failed to retrieve client Event!");
			}

			return new Net.ClientEvent(name);
		}

		/**
		 * The RemoteEvent instance
		 */
		public get Instance() {
			return this.instance;
		}

		/**
		 * The RBXScriptConnection
		 */
		public get Event() {
			return this.instance.OnClientEvent;
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
			this.instance.FireServer(...args);
		}

	}

	/**
	 * A function on the client
	 */
	export class ClientFunction extends FunctionBase {
		private lastPing = -1;
		private cached: any = [];

		constructor(name: string) {
			super(name);
			assert(IS_CLIENT, "Cannot create a Net.ClientFunction on the Server!");
			assert(functionExists(name), `The specified function '${name}' does not exist!`);
		}

		public static async WaitFor(name: string): Promise<Net.ClientFunction> {
			const fun: RemoteFunction | undefined = waitForFunction(name, MAX_CLIENT_WAITFORCHILD_TIMEOUT);
			if (!fun) {
				error("Failed to retrieve client Function!");
			}

			return new Net.ClientFunction(name);
		}

		/**
		 * The callback
		 */
		public get Callback(): Callback {
			return this.instance.OnClientInvoke;
		}

		/**
		 * Set the callback function when called by the server
		 */
		public set Callback(func: Callback) {
			this.instance.OnClientInvoke = func;
		}

		/**
		 * The remoteFunction instance
		 */
		public get Instance() {
			return this.instance;
		}

		/**
		 * The client cache in seconds
		 */
		public get Cache() {
			const cache = this.instance.FindFirstChild("Cache") as NumberValue;
			if (cache) {
				return cache.Value;
			} else {
				return 0;
			}
		}

		/**
		 * Call the server with the specified arguments
		 * @param args The arguments to call the server with
		 * @returns the result of the call to the server
		 */
		public CallServer<T extends NetworkSerializableArgs>(...args: T): NetworkSerializableReturnValue {
			if (this.lastPing < (os.time() + this.Cache)) {
				const result = this.instance.InvokeServer(...args);
				this.cached = result;

				this.lastPing = os.time();

				return result;
			} else {
				return this.cached;
			}
		}

		/**
		 * Call the server with the specified arguments asynchronously
		 * @param args The args to call the server with
		 * @async Will return a promise
		 */
		public async CallServerAsync<T extends NetworkSerializableArgs>(...args: T): Promise<NetworkSerializableReturnValue> {
			return this.CallServer(...args);
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
		if (IS_SERVER) {
			return new ServerFunction(name);
		} else {
			error("Net.createFunction can only be used on the server!");
			throw "";
		}
	}

	/**
	 * Create an event
	 * @param name The name of the event
	 * (Must be created on server)
	 */
	export function CreateEvent(name: string): ServerEvent {
		if (IS_SERVER) {
			return new ServerEvent(name);
		} else {
			error("Net.createFunction can only be used on the server!");
			throw "Net.createFunction can only be used on the server!";
		}
	}

	/**
	 * @deprecated Use `GetClientFunctionAsync` or `WaitForClientFunctionAsync`
	 */
	export function GetClientFunction(name: string): ClientFunction | undefined {
		warn("[GetClientFunction]" +
			"GetClientFunctionAsync/WaitForClientFunctionAsync should be used instead of GetClientFunction");
		warn(debug.traceback());

		if (functionExists(name)) {
			return new ClientFunction(name);
		} else {
			return undefined;
		}
	}

	// tslint:disable:jsdoc-format
	/**
	 * Wait for a client function specified by `name`
	 *
	 * Usage
	 *
```ts
Net.WaitForClientFunctionAsync("FunctionName").then(func => {
	func.Callback = clientCallbackFunction;
}, err => {
	warn("Error fetching FunctionName:", err);
});```
	 *
	 * Or inside an async function:
```ts
	const func = await Net.WaitForClientFunctionAsync("FunctionName");
	func.Callback = clientCallbackFunction;
```
	 *
	 * @param name The name of the function
	 * @alias for `Net.ClientFunction.WaitFor(name)`
	 * @returns `Promise<Net.ClientFunction>`
	 */
	// tslint:enable:jsdoc-format
	export async function WaitForClientFunctionAsync(name: string) {
		return Net.ClientFunction.WaitFor(name);
	}

	// tslint:disable:jsdoc-format
	/**
	 * Wait for a client function specified by `name`
	 *
	 * Usage
	 *
```ts
Net.WaitForClientEventAsync("EventName").then(event => {
	event.Connect(eventHandler);
}, err => {
	warn("Error fetching EventName:", err);
});```
	 *
	 * Or inside an async function:
```ts
	const event = await Net.WaitForClientEventAsync("EventName");
	event.Connect(eventHandler);
```
	 *
	 * @param name The name of the function
	 * @alias for `Net.ClientEvent.WaitFor(name)`
	 * @returns `Promise<Net.ClientEvent>`
	 */
	// tslint:enable:jsdoc-format
	export async function WaitForClientEventAsync(name: string) {
		return Net.ClientEvent.WaitFor(name);
	}

	export function GetServerEventAsync(name: string): Promise<ServerEvent> {
		return new Promise((resolve, reject) => {
			if (eventExists(name)) {
				const newFunc = new ServerEvent(name);
				resolve(newFunc);
			} else {
				reject("Could not find Server Event: " + name + " (did you create it on the server?)");
			}
		});
	}

	/**
	 * @deprecated Use `WaitForClientEventAsync`
	 */
	export async function GetClientEventAsync(name: string): Promise<ClientEvent> {
		return await WaitForClientEventAsync(name);
	}

	/**
	 * @deprecated Use `WaitForClientFunctionAsync`
	 */
	export async function GetClientFunctionAsync(name: string): Promise<ClientFunction> {
		return await WaitForClientFunctionAsync(name);
	}

	export function GetServerFunctionAsync(name: string): Promise<ServerFunction> {
		return new Promise((resolve, reject) => {
			if (functionExists(name)) {
				const newFunc = new ServerFunction(name);
				resolve(newFunc);
			} else {
				reject("Could not find Server Function: " + name + " (did you create it?)");
			}
		});
	}

	// tslint:disable:jsdoc-format
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
	 * 				Net.Bind(this.onSomeEvent, this)
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
	 * @param bindArgs
	 */
	// tslint:enable:jsdoc-format
	export function Bind<T extends Array<any>, U, E extends Array<any>>(
		func: (...args: T) => U, thisArg: any, ...bindArgs: E) {
		return (...callbackArgs: T) => {
			const resultingArgs = [
				thisArg,
				...bindArgs,
				...callbackArgs,
			];

			(func as any)(...resultingArgs);
		};
	}

	/**
	 * @deprecated
	 */
	export const bind = Bind;

	if (IS_STUDIO) {
		print("[rbx-net] Loaded rbx-net", getVersion());
	}
}

export default Net;
