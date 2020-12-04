const replicatedStorage = game.GetService("ReplicatedStorage");
const runService = game.GetService("RunService");

interface RemoteTypes {
	RemoteEvent: RemoteEvent;
	RemoteFunction: RemoteFunction;
	AsyncRemoteFunction: RemoteEvent;
}

export interface RequestCounter {
	Increment(player: Player): void;
	Get(player: Player): number;
}

/** @internal */
export const IS_SERVER = !runService.IsRunning() || runService.IsServer();

/** @internal */
export const IS_CLIENT = runService.IsRunning() && runService.IsClient();

export const IS_RUNNING = runService.IsRunning();

/** @internal */
export const MAX_CLIENT_WAITFORCHILD_TIMEOUT = 10;

/** @internal */
export function getGlobalRemote(name: string) {
	return `$${name}`;
}

/** @internal */
export function isLuaTable(value: unknown): value is Map<unknown, unknown> {
	return typeIs(value, "table");
}

export interface NetManagedEvent {
	GetInstance(): RemoteEvent;
}

const REMOTES_FOLDER_NAME = "Net";
const FUNCTIONS_FOLDER_NAME = "NetManagedFunctions";
const EVENTS_FOLDER_NAME = "NetManagedEvents";
const ASYNC_FUNCTIONS_FOLDER_NAME = "NetManagedAsyncFunctions";

/** @internal */
export const ServerTickFunctions = new Array<() => void>();

/** @internal */
export function findOrCreateFolder(parent: Instance, name: string): Folder {
	let folder = parent.FindFirstChild(name) as Folder;
	if (folder) {
		return folder;
	} else {
		folder = new Instance("Folder", parent);
		folder.Name = name;
		return folder;
	}
}

const remoteFolder = findOrCreateFolder(replicatedStorage, REMOTES_FOLDER_NAME);
const functionFolder = findOrCreateFolder(remoteFolder, FUNCTIONS_FOLDER_NAME);
const eventFolder = findOrCreateFolder(remoteFolder, EVENTS_FOLDER_NAME);
const asyncFunctionFolder = findOrCreateFolder(remoteFolder, ASYNC_FUNCTIONS_FOLDER_NAME);

/**
 * Errors with variables formatted in a message
 * @param message The message
 * @param vars variables to pass to the error message
 */
export function errorft(message: string, vars: { [name: string]: unknown }): never {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	[message] = message.gsub("{([%w_][%w%d_]*)}", (token: string) => {
		return vars[token] || token;
	});

	error(message, 2);
}

/** @internal */
export function eventExists(name: string) {
	return eventFolder.FindFirstChild(name) !== undefined;
}

/** @internal */
export function functionExists(name: string) {
	return functionFolder.FindFirstChild(name) !== undefined;
}

/** @internal */
export function waitForEvent(name: string, timeOut: number): RemoteEvent | undefined {
	return eventFolder.WaitForChild(name, timeOut) as RemoteEvent | undefined;
}

/** @internal */
export function waitForFunction(name: string, timeOut: number): RemoteFunction | undefined {
	return functionFolder.WaitForChild(name, timeOut) as RemoteFunction | undefined;
}

/** @internal */
export function getRemoteFolder<K extends keyof RemoteTypes>(remoteType: K): Folder {
	let targetFolder: Folder;
	if (remoteType === "RemoteEvent") {
		targetFolder = eventFolder;
	} else if (remoteType === "RemoteFunction") {
		targetFolder = functionFolder;
	} else if (remoteType === "AsyncRemoteFunction") {
		targetFolder = asyncFunctionFolder;
	} else {
		return error("Invalid type: " + remoteType);
	}

	return targetFolder;
}

/** @internal */
export function findRemote<K extends keyof RemoteTypes>(remoteType: K, name: string): RemoteTypes[K] | undefined {
	const targetFolder = getRemoteFolder(remoteType);
	const existing = targetFolder.FindFirstChild(name) as RemoteFunction | RemoteEvent;

	return existing as RemoteTypes[K] | undefined;
}

/** @internal */
export function getRemoteOrThrow<K extends keyof RemoteTypes>(remoteType: K, name: string): RemoteTypes[K] {
	const existing = findRemote(remoteType, name);
	if (existing) {
		return existing;
	} else {
		throw `Could not find Remote of type ${remoteType} called "${name}"`;
	}
}

/** @internal */
export function findOrCreateRemote<K extends keyof RemoteTypes>(remoteType: K, name: string): RemoteTypes[K] {
	const existing = findRemote(remoteType, name);
	if (existing) {
		return existing;
	} else {
		if (!IS_SERVER) {
			throw "Creation of Events or Functions must be done on server!";
		}

		let remote: RemoteEvent | RemoteFunction;

		if (remoteType === "RemoteEvent") {
			remote = new Instance("RemoteEvent");
		} else if (remoteType === "AsyncRemoteFunction") {
			remote = new Instance("RemoteEvent");
		} else if (remoteType === "RemoteFunction") {
			remote = new Instance("RemoteFunction");
		} else {
			throw `Invalid Remote Type: ${remoteType}`;
		} // stfu

		remote.Name = name;
		remote.Parent = getRemoteFolder(remoteType);
		return remote as RemoteTypes[K];
	}
}

export interface IAsyncListener {
	connection: RBXScriptConnection;
	timeout: number;
}

export function checkArguments(types: Array<TypeGuard<any>>, args?: Array<unknown>) {
	if (args === undefined) {
		warn("[net-types] Argument length is zero");
		return false;
	}

	for (let i = 0; i < types.size(); i++) {
		const typeCheck = types[i];
		const value = args[i];
		if (!typeCheck(value)) {
			warn(`[net-types] Argument at index ${i} was invalid type.`);
			return false;
		}
	}

	return true;
}

export type TypeGuard<T> = (value: unknown) => value is T;

export type TypeGuards<T> = T extends [TypeGuard<infer A>]
	? [TypeGuard<A>]
	: T extends [TypeGuard<infer A>, TypeGuard<infer B>]
	? [TypeGuard<A>, TypeGuard<B>]
	: T extends [TypeGuard<infer A>, TypeGuard<infer B>, TypeGuard<infer C>]
	? [A, B, C]
	: T extends [TypeGuard<infer A>, TypeGuard<infer B>, TypeGuard<infer C>, TypeGuard<infer D>]
	? [A, B, C, D]
	: T extends [TypeGuard<infer A>, TypeGuard<infer B>, TypeGuard<infer C>, TypeGuard<infer D>, TypeGuard<infer E>]
	? [A, B, C, D, E]
	: T extends [
			TypeGuard<infer A>,
			TypeGuard<infer B>,
			TypeGuard<infer C>,
			TypeGuard<infer D>,
			TypeGuard<infer E>,
			TypeGuard<infer F>,
	  ]
	? [A, B, C, D, E, F]
	: T extends [
			TypeGuard<infer A>,
			TypeGuard<infer B>,
			TypeGuard<infer C>,
			TypeGuard<infer D>,
			TypeGuard<infer E>,
			TypeGuard<infer F>,
			TypeGuard<infer G>,
	  ]
	? [A, B, C, D, E, F, G]
	: T extends [
			TypeGuard<infer A>,
			TypeGuard<infer B>,
			TypeGuard<infer C>,
			TypeGuard<infer D>,
			TypeGuard<infer E>,
			TypeGuard<infer F>,
			TypeGuard<infer G>,
			TypeGuard<infer H>,
	  ]
	? [A, B, C, D, E, F, G, H]
	: Array<unknown>; // default, if user has more than 8 args then wtf they doing with their lives?!?

export type StaticArguments<T> = T extends [TypeGuard<infer A>]
	? [A]
	: T extends [TypeGuard<infer A>, TypeGuard<infer B>]
	? [A, B]
	: T extends [TypeGuard<infer A>, TypeGuard<infer B>, TypeGuard<infer C>]
	? [A, B, C]
	: T extends [TypeGuard<infer A>, TypeGuard<infer B>, TypeGuard<infer C>, TypeGuard<infer D>]
	? [A, B, C, D]
	: T extends [TypeGuard<infer A>, TypeGuard<infer B>, TypeGuard<infer C>, TypeGuard<infer D>, TypeGuard<infer E>]
	? [A, B, C, D, E]
	: T extends [
			TypeGuard<infer A>,
			TypeGuard<infer B>,
			TypeGuard<infer C>,
			TypeGuard<infer D>,
			TypeGuard<infer E>,
			TypeGuard<infer F>,
	  ]
	? [A, B, C, D, E, F]
	: T extends [
			TypeGuard<infer A>,
			TypeGuard<infer B>,
			TypeGuard<infer C>,
			TypeGuard<infer D>,
			TypeGuard<infer E>,
			TypeGuard<infer F>,
			TypeGuard<infer G>,
	  ]
	? [A, B, C, D, E, F, G]
	: T extends [
			TypeGuard<infer A>,
			TypeGuard<infer B>,
			TypeGuard<infer C>,
			TypeGuard<infer D>,
			TypeGuard<infer E>,
			TypeGuard<infer F>,
			TypeGuard<infer G>,
			TypeGuard<infer H>,
	  ]
	? [A, B, C, D, E, F, G, H]
	: Array<unknown>; // default, if user has more than 8 args then wtf they doing with their lives?!?

if (IS_SERVER) {
	game.GetService("RunService").Stepped.Connect((time, step) => {
		for (const f of ServerTickFunctions) {
			f();
		}
	});
}
