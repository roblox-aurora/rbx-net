const replicatedStorage = game.GetService("ReplicatedStorage");
const runService = game.GetService("RunService");

export interface RequestCounter {
	Increment(player: Player): void;
	Get(player: Player): number;
}

/** @internal */
export const IS_SERVER = runService.IsServer();

/** @internal */
export const IS_CLIENT = (__LEMUR__ && !runService.IsServer()) || runService.IsClient();

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

const REMOTES_FOLDER_NAME = "Remotes";
const FUNCTIONS_FOLDER_NAME = "Functions";
const EVENTS_FOLDER_NAME = "Events";

let remoteFolder: Folder;
let eventFolder: Folder;
let functionFolder: Folder;

/** @internal */
export const ServerTickFunctions = new Array<() => void>();

/** @internal */
export function findOrCreateFolder(parent: Instance, name: string): Folder {
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
export function errorft(message: string, vars: { [name: string]: unknown }) {
	message = message.gsub("{([%w_][%w%d_]*)}", (token: string) => {
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
	return eventFolder.WaitForChild(name, timeOut);
}

/** @internal */
export function waitForFunction(name: string, timeOut: number): RemoteFunction | undefined {
	return functionFolder.WaitForChild(name, timeOut);
}

/** @internal */
export function getRemoteFolder<K extends keyof RemoteTypes>(remoteType: K): Folder {
	let targetFolder: Folder;
	if (remoteType === "RemoteEvent") {
		targetFolder = eventFolder;
	} else if (remoteType === "RemoteFunction") {
		targetFolder = functionFolder;
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

		if (remoteType === "RemoteEvent" || remoteType === "RemoteFunction") {
			remote = new Instance(remoteType);
		} else {
			throw `Invalid Remote Type: ${remoteType}`;
		} // stfu

		remote.Name = name;
		remote.Parent = getRemoteFolder(remoteType);
		return remote as RemoteTypes[K];
	}
}

if (IS_SERVER) {
	game.GetService("RunService").Stepped.Connect((time, step) => {
		for (const f of ServerTickFunctions) {
			f();
		}
	});
}
