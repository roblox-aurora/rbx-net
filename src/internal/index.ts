import { $package } from "rbxts-transform-debug";
import { $env } from "rbxts-transform-env";
import MiddlewareEvent from "../server/MiddlewareEvent";
import MiddlewareFunction from "../server/MiddlewareFunction";

const HttpService = game.GetService("HttpService");
const runService = game.GetService("RunService");
const collectionService = game.GetService("CollectionService");

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
export const NAMESPACE_SEPARATOR = "/";

/** @internal */
export const NAMESPACE_ROOT = "@";

/** @internal */
export const IS_SERVER = !runService.IsRunning() || runService.IsServer();

/** @internal */
export const IS_CLIENT = runService.IsRunning() && runService.IsClient();

export const IS_RUNNING = runService.IsRunning();

/** @internal */
export const MAX_CLIENT_WAITFORCHILD_TIMEOUT = 10;

/** @internal */
export function getGlobalRemote(name: string) {
	return `:\\${name}`;
}

/** @internal */
export function isLuaTable(value: unknown): value is Map<unknown, unknown> {
	return typeIs(value, "table");
}

export interface NetManagedInstance {
	GetInstance(): RemoteEvent | RemoteFunction;
}

/** @internal */
export class NetMiddlewareEvent implements NetManagedInstance {
	constructor(private netInstance: MiddlewareEvent | MiddlewareFunction) {}
	GetInstance(): RemoteEvent | RemoteFunction {
		return this.netInstance.GetInstance();
	}
}

const REMOTES_FOLDER_NAME = ".RbxNetManaged";

/** @internal */
export const enum TagId {
	RecieveOnly = "NetRecieveOnly",
	Managed = "NetManagedInstance",
	DefaultFunctionListener = "NetDefaultListener",
	Async = "NetManagedAsyncFunction",
	LegacyFunction = "NetManagedLegacyFunction",
	Event = "NetManagedEvent",
	DefinitionManaged = "NetDefinitionManaged",
}

/** @internal */
export const ServerTickFunctions = new Array<() => void>();

export function findOrCreatePath(parent: Instance, ...path: string[]): Folder {
	assert(path.size() > 0, "Path cannot be empty");

	while (path.size() > 0) {
		const nextItem = path.shift();
		if (nextItem !== undefined) {
			let folder = parent.FindFirstChild(nextItem);
			if (!folder) {
				folder = new Instance("Folder", parent);
				folder.Name = nextItem;
			}

			parent = folder;
		} else {
			break;
		}
	}

	return parent as Folder;
}

// /** @internal */
// export function findOrCreateFolder(parent: Instance, name: string): Folder {
// 	let folder = parent.FindFirstChild(name) as Folder;
// 	if (folder) {
// 		return folder;
// 	} else {
// 		folder = new Instance("Folder", parent);
// 		folder.Name = name;
// 		return folder;
// 	}
// }

// const dist = $env<"TS" | "Luau" | "TestTS">("TYPE", "TS");
const location = script.Parent!;

// Since apparently this is still not a type?
declare global {
	interface String {
		gsub(
			this: string,
			pattern: string,
			repl: (...tokens: string[]) => string | number,
			n?: number | undefined,
		): LuaTuple<[string, number]>;
	}
}

/**
 * Errors with variables formatted in a message
 * @param message The message
 * @param vars variables to pass to the error message
 */
export function errorft(message: string, vars: { [name: string]: string | number }): never {
	[message] = message.gsub("{([%w_][%w%d_]*)}", (token: string) => {
		return vars[token] ?? token;
	});

	error(message, 2);
}

const traceSet = new Set<string>();
export function warnOnce(message: string) {
	const trace = debug.traceback();
	if (traceSet.has(trace)) {
		return;
	}
	traceSet.add(trace);
	warn(`[rbx-net] ${message}`);
}

export function format(message: string, vars: { [name: string]: string | number }) {
	[message] = message.gsub("{([%w_][%w%d_]*)}", (token: string) => {
		return vars[token] ?? token;
	});
	return message;
}

/** @internal */
export function waitForRemote<K extends keyof RemoteTypes>(remoteType: K, name: string, timeout: number) {
	return Promise.defer<RemoteTypes[K]>((resolve, reject) => {
		// First, check if remote already exists
		let result: RemoteTypes[K] | undefined = findRemote(remoteType, name);
		if (result) {
			resolve(result);
			return;
		}

		// If not, poll until timeout
		let elapsed = 0;
		while (elapsed < timeout) {
			elapsed += runService.Heartbeat.Wait()[0];
			result = findRemote(remoteType, name);
			if (result) {
				resolve(result);
				return;
			}
		}

		reject(`Timed out while waiting for ${remoteType} '${name}' after ${elapsed} seconds.`);
	});
}

/** @internal */
export function findRemote<K extends keyof RemoteTypes>(remoteType: K, name: string): RemoteTypes[K] | undefined {
	if (remoteType === "AsyncRemoteFunction") {
		return collectionService.GetTagged(TagId.Async).find((f) => f.Name === name) as RemoteTypes[K] | undefined;
	} else if (remoteType === "RemoteEvent") {
		return collectionService.GetTagged(TagId.Event).find((f) => f.Name === name) as RemoteTypes[K] | undefined;
	} else if (remoteType === "RemoteFunction") {
		return collectionService.GetTagged(TagId.LegacyFunction).find((f) => f.Name === name) as
			| RemoteTypes[K]
			| undefined;
	}

	throw `Invalid Remote Access`;
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

const version = $package.version;
let staticPath: Folder | undefined;

/**
 * Generates a hash code from a string
 * @param str The string to generate a hash code from
 * @returns The hash code of the given string
 */
function hashCode(str: string): number {
	let hash = 0;
	if (str.size() === 0) {
		return hash;
	}
	for (let i = 0; i < str.size(); i++) {
		const [char] = string.byte(string.sub(str, i + 1, i + 1));
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}
	return math.abs(hash);
}

const workspace = game.GetService("Workspace");

/**
 * @internal
 */
function getStaticPath(): Folder {
	if (staticPath) {
		return staticPath;
	} else {
		const [M, m] = version.split(".");
		staticPath = findOrCreatePath(
			game.GetService("ReplicatedStorage"),
			REMOTES_FOLDER_NAME,
			runService.IsStudio()
				? [M, m].join(".")
				: string.format(
						"%.12x",
						hashCode([M, m].join(".")) * (workspace.GetServerTimeNow() - workspace.DistributedGameTime),
				  ),
		);
		return staticPath;
	}
}

/** @internal */
export function findOrCreateRemote<K extends keyof RemoteTypes>(
	remoteType: K,
	name: string,
	onCreate?: (instance: RemoteTypes[K]) => void,
	parentTo = getStaticPath(),
): RemoteTypes[K] {
	const existing = findRemote(remoteType, name);
	if (existing) {
		if (collectionService.HasTag(existing, TagId.DefinitionManaged)) {
			warnOnce(
				`Fetching ${remoteType} '${name}', which is a DefinitionsManaged instance from a non-definitions context. This is considered unsafe.`,
			);
		}
		return existing;
	} else {
		if (!IS_SERVER) {
			throw "Creation of Events or Functions must be done on server!";
		}

		let remote: RemoteEvent | RemoteFunction;

		if (remoteType === "RemoteEvent") {
			remote = new Instance("RemoteEvent");
			collectionService.AddTag(remote, TagId.Event);
		} else if (remoteType === "AsyncRemoteFunction") {
			remote = new Instance("RemoteEvent");
			collectionService.AddTag(remote, TagId.Async);
		} else if (remoteType === "RemoteFunction") {
			remote = new Instance("RemoteFunction");
			collectionService.AddTag(remote, TagId.LegacyFunction);
		} else {
			throw `Invalid Remote Type: ${remoteType}`;
		}

		remote.Name = name;
		remote.Parent = parentTo;

		onCreate?.(remote as RemoteTypes[K]);
		return remote as RemoteTypes[K];
	}
}

export interface IAsyncListener {
	connection: RBXScriptConnection;
	timeout: number;
}

/** @internal */
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
