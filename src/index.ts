import * as throttler from "./Throttle";

const Players = game.GetService("Players");

interface RemoteTypes {
	RemoteEvent: RemoteEvent;
	RemoteFunction: RemoteFunction;
}

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
let throttleResetTimer = 60;
let rateLimitReachedMessage = "Request limit exceeded ({limit}) by {player} via {remote}";

function findOrCreateFolder(parent: Instance, name: string): Folder {
	let folder = parent.FindFirstChild<Folder>(name);
	if (folder) {
		return folder;
	} else {
		folder = new Instance("Folder", parent);
		folder.Name = name;
		return folder;
	}
}

remoteFolder = findOrCreateFolder(replicatedStorage, REMOTES_FOLDER_NAME);
functionFolder = findOrCreateFolder(remoteFolder, FUNCTIONS_FOLDER_NAME);
eventFolder = findOrCreateFolder(remoteFolder, EVENTS_FOLDER_NAME);

/**
 * Errors with variables formatted in a message
 * @param message The message
 * @param vars variables to pass to the error message
 */
function errorft(message: string, vars: { [name: string]: unknown }) {
	message = message.gsub("{([%w_][%w%d_]*)}", (token: string) => {
		return vars[token] || token;
	});

	error(message, 2);
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

function getRemoteFolder<K extends keyof RemoteTypes>(type: K): Folder {
	let targetFolder: Folder;
	if (type === "RemoteEvent") {
		targetFolder = eventFolder;
	} else if (type === "RemoteFunction") {
		targetFolder = functionFolder;
	} else {
		throw "Invalid type: " + type;
	}

	return targetFolder;
}

function findRemoteOrThrow<K extends keyof RemoteTypes>(type: K, name: string): RemoteTypes[K] {
	const targetFolder = getRemoteFolder(type);
	const existing = targetFolder.FindFirstChild(name) as RemoteFunction | RemoteEvent;
	if (existing) {
		return existing;
	} else {
		throw `Could not find Remote of type ${type} called "${name}"`;
	}
}

function findOrCreateRemote<K extends keyof RemoteTypes>(type: K, name: string): RemoteTypes[K] {
	const targetFolder = getRemoteFolder(type);

	const existing = targetFolder.FindFirstChild(name) as RemoteFunction | RemoteEvent;
	if (existing) {
		return existing;
	} else {
		if (!IS_SERVER) {
			throw "Creation of Events or Functions must be done on server!";
		}

		let remote: RemoteEvent | RemoteFunction;

		if (type === "RemoteEvent" || type === "RemoteFunction") {
			remote = new Instance(type);
		} else {
			throw `Invalid Remote Type: ${type}`;
		} // stfu

		remote.Name = name;
		remote.Parent = targetFolder;
		return remote;
	}
}

interface RbxNetConfigItem {
	/**
	 * The throttle reset timer (default: 60 seconds)
	 */
	ServerThrottleResetTimer: number;

	/**
	 * The message shown when the throttle has been exceeded.
	 * {player} will be replaced with the player's name!
	 */
	ServerThrottleMessage: string;

	/** @internal */
	__stfuTypescript: undefined;
}

/**
 * Typescript Networking Library for ROBLOX
 */
export namespace Net {
	const MAX_CLIENT_WAITFORCHILD_TIMEOUT = 10;

	interface VersionType { major: number; minor: number; revision: number; }
	interface VersionInformation { number: VersionType; date: number; tag?: string; }

	/**
	 * Version information
	 * @internal
	 */
	export const VERSION: VersionInformation = {
		number: { major: 0, minor: 6, revision: 1 },
		date: 190205,
		tag: "beta",
	};

	setmetatable(VERSION, {
		__tostring: (self) => {
			const { major, minor, revision } = self.number;

			return `${major}.${minor}.${revision}`;
		},
	});

	export function SetConfiguration<K extends keyof RbxNetConfigItem>(key: K, value: RbxNetConfigItem[K]) {
		assert(IS_SERVER, "Cannot modify configuration on client!");
		if (key === "ServerThrottleResetTimer") {
			throttleResetTimer = value as number;
		} else if (key === "ServerThrottleMessage") {
			rateLimitReachedMessage = value as string;
		}
	}

	export function GetConfiguration<K extends keyof RbxNetConfigItem>(key: K): RbxNetConfigItem[K] {
		if (key === "ServerThrottleResetTimer") {
			assert(IS_SERVER, "ServerThrottleResetTimer is not used on the client!");
			return throttleResetTimer;
		} else if (key === "ServerThrottleMessage") {
			assert(IS_SERVER, "ServerThrottleMessage is not used on the client!");
			return rateLimitReachedMessage;
		} else {
			return undefined;
		}
	}

	/**
	 * An event on the server
	 * @rbxts server
	 */
	export class ServerEvent {
		/** @internal */
		protected instance: RemoteEvent;

		/**
		 * Creates a new instance of a server event (Will also create the corresponding remote if it does not exist!)
		 * @param name The name of this server event
		 * @throws If not created on server
		 */
		constructor(name: string) {
			this.instance = findOrCreateRemote("RemoteEvent", name);
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
		public Connect<T extends Array<unknown>>(callback: (sourcePlayer: Player, ...args: T) => void) {
			this.Event.Connect(callback as Callback);
		}

		/**
		 * Sends the specified arguments to all players
		 * @param args The arguments to send to the players
		 */
		public SendToAllPlayers<T extends Array<any>>(...args: T) {
			this.instance.FireAllClients(...args);
		}

		/**
		 * Will send this message to all players except specified players
		 * @param blacklist The blacklist
		 * @param args The arguments
		 */
		public SendToAllPlayersExcept<T extends Array<any>>(blacklist: Player | Array<Player>, ...args: T) {
			if (typeIs(blacklist, "Instance")) {
				const otherPlayers = Players.GetPlayers().filter(p => p !== blacklist);
				for (const player of otherPlayers) {
					this.instance.FireClient(player, ...args);
				}
			} else if (typeof blacklist === "object") {
				for (const player of Players.GetPlayers()) {
					if (blacklist.indexOf(player) === -1) {
						this.instance.FireClient(player, ...args);
					}
				}
			}
		}

		/**
		 * Sends the specified arguments to a specified player
		 * @param player The player
		 * @param args The arguments to send to the player
		 */
		public SendToPlayer<T extends Array<any>>(player: Player, ...args: T) {
			this.instance.FireClient(player, ...args);
		}

		/**
		 * Sends the specified argumetns to the specified list of players
		 * @param players The players
		 * @param args The arugments to send to these players
		 */
		public SendToPlayers<T extends Array<any>>(players: Array<Player>, ...args: T) {
			for (const player of players) {
				this.SendToPlayer(player, ...args);
			}
		}
	}

	/**
	 * A function on the server
	 * @rbxts server
	 */
	export class ServerFunction<CR extends any = any> {
		/** @internal */
		protected instance: RemoteFunction;

		/**
		 * Creates a new instance of a server function (Will also create the corresponding remote if it does not exist!)
		 * @param name The name of this server function
		 * @param rateLimit The number of requests allowed per minute per client (0 = none)
		 * @throws If not created on server
		 */
		constructor(name: string) {
			this.instance = findOrCreateRemote("RemoteFunction", name);
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
				const cacheTimer = new Instance("NumberValue", this.instance);
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
		public async CallPlayerAsync<T extends Array<any>>(
			player: Player, ...args: T): Promise<CR> {
			return this.instance.InvokeClient(player, ...args) as any;
		}

	}

	interface RequestCounter { Increment(player: Player): void; Get(player: Player): number; }

	/**
	 * A server event that can be rate limited
	 * @rbxts server
	 */
	export class ServerThrottledEvent extends ServerEvent {
		private maxRequestsPerMinute: number = 0;
		private clientRequests: RequestCounter;

		constructor(name: string, rateLimit: number) {
			super(name);
			this.maxRequestsPerMinute = rateLimit;

			this.clientRequests = throttler.Get(`Event~${name}`);

			const clientValue = new Instance("IntValue", this.instance);
			clientValue.Name = "RateLimit";
			clientValue.Value = rateLimit;
		}

		/**
		 * The RBXScriptSignal for this RemoteEvent
		 */
		public get Event() {
			error("Use 'Connect' instead foor ServerThrottledEvent!");
			return this.instance.OnServerEvent;
		}

		/**
		 * Connect a fucntion to fire when the event is invoked by the client
		 * @param callback The function fired when the event is invoked by the client
		 */
		public Connect<T extends Array<any>>(callback: (sourcePlayer: Player, ...args: T) => void) {
			this.instance.OnServerEvent.Connect((player: Player, ...args: Array<any>) => {
				const maxRequests = this.maxRequestsPerMinute;
				const clientRequestCount = this.clientRequests.Get(player);
				if (clientRequestCount >= maxRequests) {
					errorft(rateLimitReachedMessage, {
						player: player.UserId,
						remote: this.instance.Name,
						limit: maxRequests,
					});
				} else {
					this.clientRequests.Increment(player);
					callback(player, ...args as T);
				}
			});
		}

		/**
		 * The number of requests allowed per minute per user
		 */
		public set RateLimit(requestsPerMinute: number) {
			this.maxRequestsPerMinute = requestsPerMinute;

			let clientValue = this.instance.FindFirstChild<IntValue>("RateLimit");
			if (clientValue) {
				clientValue.Value = requestsPerMinute;
			} else {
				clientValue = new Instance("IntValue", this.instance);
				clientValue.Name = "RateLimit";
				clientValue.Value = requestsPerMinute;
			}
		}

		public get RateLimit() {
			return this.maxRequestsPerMinute;
		}
	}

	/**
	 * A server function that can be rate limited
	 * @rbxts server
	 */
	export class ServerThrottledFunction<CR extends any = any> extends ServerFunction<CR> {
		/** @internal */
		public static rates = new Map<string, Array<number>>();

		private maxRequestsPerMinute: number = 0;
		private clientRequests: RequestCounter;

		constructor(name: string, rateLimit: number) {
			super(name);
			this.maxRequestsPerMinute = rateLimit;

			this.clientRequests = throttler.Get(`Function~${name}`);

			const clientValue = new Instance("IntValue", this.instance);
			clientValue.Name = "RateLimit";
			clientValue.Value = rateLimit;
		}

		public set Callback(callback: Callback) {
			this.instance.OnServerInvoke = (player: Player, ...args: Array<unknown>) => {
				const maxRequests = this.maxRequestsPerMinute;
				const clientRequestCount = this.clientRequests.Get(player);
				if (clientRequestCount >= maxRequests) {
					errorft(rateLimitReachedMessage, {
						player: player.UserId,
						remote: this.instance.Name,
						limit: maxRequests,
					});
				} else {
					this.clientRequests.Increment(player);
					return callback(player, ...args);
				}
			};
		}

		/**
		 * The number of requests allowed per minute per user
		 */
		public set RateLimit(requestsPerMinute: number) {
			this.maxRequestsPerMinute = requestsPerMinute;

			let clientValue = this.instance.FindFirstChild<IntValue>("RateLimit");
			if (clientValue) {
				clientValue.Value = requestsPerMinute;
			} else {
				clientValue = new Instance("IntValue", this.instance);
				clientValue.Name = "RateLimit";
				clientValue.Value = requestsPerMinute;
			}
		}

		public get RateLimit() {
			return this.maxRequestsPerMinute;
		}
	}

	/**
	 * An event on the client
	 * @rbxts client
	 */
	export class ClientEvent {
		/** @internal */
		private instance: RemoteEvent;

		/**
		 * Create a new instance of the ClientEvent
		 * @param name The name of the client event
		 * @throws If created on server, or does not exist.
		 */
		constructor(name: string) {
			this.instance = findRemoteOrThrow("RemoteEvent", name);
			assert(IS_CLIENT, "Cannot create a Net.ClientEvent on the Server!");
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
		public Connect<T extends Array<any>>(callback: (...args: T) => void) {
			this.Event.Connect(callback as Callback);
		}

		/**
		 * Sends the specified arguments to the server
		 * @param args The arguments to send to the server
		 */
		public SendToServer<T extends Array<any>>(...args: T) {
			this.instance.FireServer(...args);
		}

	}

	/**
	 * A function on the client
	 * @rbxts client
	 */
	export class ClientFunction<SR extends any> {
		/** @internal */
		private lastPing = -1;
		/** @internal */
		private cached: unknown = [];
		/** @internal */
		private instance: RemoteFunction;

		constructor(name: string) {
			this.instance = findRemoteOrThrow("RemoteFunction", name);
			assert(IS_CLIENT, "Cannot create a Net.ClientFunction on the Server!");
			assert(functionExists(name), `The specified function '${name}' does not exist!`);
		}

		public static async WaitFor<R extends any>(name: string): Promise<Net.ClientFunction<R>> {
			const fun: RemoteFunction | undefined = waitForFunction(name, MAX_CLIENT_WAITFORCHILD_TIMEOUT);
			if (!fun) {
				error("Failed to retrieve client Function!");
			}

			return new Net.ClientFunction<R>(name);
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
		public CallServer<T extends Array<any>>(...args: T): SR {
			if (this.lastPing < (os.time() + this.Cache)) {
				const result = this.instance.InvokeServer(...args);
				this.cached = result;

				this.lastPing = os.time();

				return result as any;
			} else {
				return this.cached as SR;
			}
		}

		/**
		 * Call the server with the specified arguments asynchronously
		 * @param args The args to call the server with
		 * @async Will return a promise
		 */
		public async CallServerAsync<T extends Array<any>>(...args: T): Promise<SR> {
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
	 * @rbxts server
	 */
	export function CreateFunction<CR extends any>(name: string): ServerFunction<CR> {
		if (IS_SERVER) {
			return new ServerFunction<CR>(name);
		} else {
			error("Net.createFunction can only be used on the server!");
			throw "";
		}
	}

	/**
	 * Creates a function that has a limited number of client requests every timeout (default 60 seconds)
	 * @param name The name of the function
	 * @param rateLimit The amount of requests allowed by clients in the rate timeout (default 60 seconds)
	 * @rbxts server
	 */
	export function CreateThrottledFunction<CR extends any>(name: string, rateLimit: number): ServerThrottledFunction<CR> {
		if (IS_SERVER) {
			return new ServerThrottledFunction<CR>(name, rateLimit);
		} else {
			error("Net.createFunction can only be used on the server!");
			throw "";
		}
	}

	/**
	 * Creates an event that has a limited number of client requests every timeout (default 60 seconds)
	 * @param name The name of the event
	 * @param rateLimit The amount of requests allowed by clients in the rate timeout (default 60 seconds)
	 * @rbxts server
	 */
	export function CreateThrottledEvent(name: string, rateLimit: number): ServerThrottledEvent {
		if (IS_SERVER) {
			return new ServerThrottledEvent(name, rateLimit);
		} else {
			error("Net.createFunction can only be used on the server!");
			throw "Net.createFunction can only be used on the server!";
		}
	}

	/**
	 * Create an event
	 * @param name The name of the event
	 * @rbxts server
	 */
	export function CreateEvent(name: string): ServerEvent {
		if (IS_SERVER) {
			return new ServerEvent(name);
		} else {
			error("Net.createFunction can only be used on the server!");
			throw "Net.createFunction can only be used on the server!";
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
	 * @rbxts client
	 */
	// tslint:enable:jsdoc-format
	export async function WaitForClientFunctionAsync<R extends any>(name: string) {
		return Net.ClientFunction.WaitFor<R>(name);
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
	 * @rbxts client
	 */
	// tslint:enable:jsdoc-format
	export async function WaitForClientEventAsync(name: string) {
		return Net.ClientEvent.WaitFor(name);
	}

	/** @rbxts server */
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

	/** @rbxts server */
	export function GetServerFunctionAsync<CR extends any>(name: string): Promise<ServerFunction<CR>> {
		return new Promise((resolve, reject) => {
			if (functionExists(name)) {
				const newFunc = new ServerFunction(name);
				resolve(newFunc);
			} else {
				reject("Could not find Server Function: " + name + " (did you create it?)");
			}
		});
	}

	if (IS_STUDIO) {
		print("[rbx-net] Loaded rbx-net", `v${VERSION}`);
	}

	if (IS_SERVER) {
		let lastTick = 0;
		game.GetService("RunService").Stepped.Connect((time, step) => {
			if (tick() > lastTick + throttleResetTimer) {
				lastTick = tick();
				throttler.Clear();
			}
		});
	}
}

export default Net;
