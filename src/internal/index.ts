import MiddlewareEvent from "../server/MiddlewareEvent";
import MiddlewareFunction from "../server/MiddlewareFunction";
import { MockRemoteEvent, MockRemoteFunction } from "./mock/mock";

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

/** @internal */
export const IS_STUDIO = !runService.IsRunning();

/** @internal */
export const IS_PLUGIN = script.FindFirstAncestorOfClass("Plugin") !== undefined;

/** @internal */
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

const REMOTES_FOLDER_NAME = "_NetManaged";

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

const location = IS_PLUGIN ? game.GetService("ReplicatedStorage") : script.Parent!;

const remoteFolder = findOrCreateFolder(location, REMOTES_FOLDER_NAME);
/**
 * Errors with variables formatted in a message
 * @param message The message
 * @param vars variables to pass to the error message
 */
export function errorft(message: string, vars: { [name: string]: unknown }): never {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
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

export function format(message: string, vars: { [name: string]: unknown }) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	[message] = message.gsub("{([%w_][%w%d_]*)}", (token: string) => {
		return vars[token] ?? token;
	});
	return message;
}

/** @internal */
export function waitForRemote<K extends keyof RemoteTypes>(remoteType: K, name: string, timeout: number) {
	return Promise.defer<RemoteTypes[K]>((resolve, reject) => {
		let i = 0;
		let result: RemoteTypes[K] | undefined;
		do {
			const [step] = runService.Heartbeat.Wait();
			i += step;
			result = findRemote(remoteType, name);
		} while (i < timeout && !result);
		if (result) {
			resolve(result);
		} else {
			reject(`Timed out while waiting for ${remoteType} '${name}' after ${timeout} seconds.`);
		}
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
	``;
}

const mockRemoteCache = new Map<string, RemoteEvent | RemoteFunction>();

/** @internal */
export function findMockRemote<K extends keyof RemoteTypes>(remoteType: K, name: string): RemoteTypes[K] | undefined {
	const remote = mockRemoteCache.get(`${remoteType}~${name}`);
	if (!remote) {
		throw `Could not find Remote of type ${remoteType} called "${name}"`;
	} else {
		return remote as RemoteTypes[K] | undefined;
	}
}

/** @internal */
export function getRemoteOrThrow<K extends keyof RemoteTypes>(remoteType: K, name: string): RemoteTypes[K] {
	const existing = IS_STUDIO && !IS_PLUGIN ? findMockRemote(remoteType, name) : findRemote(remoteType, name);
	if (existing) {
		return existing;
	} else {
		throw `Could not find Remote of type ${remoteType} called "${name}"`;
	}
}

export function createMockRemote<K extends keyof RemoteTypes>(
	remoteType: K,
	name: string,
	onCreate?: (instance: RemoteTypes[K]) => void,
) {
	const existing = mockRemoteCache.get(`${remoteType}~${name}`);
	if (existing) {
		return (existing as unknown) as RemoteTypes[K];
	} else {
		let remote: RemoteEvent | RemoteFunction;

		if (remoteType === "RemoteEvent" || remoteType === "AsyncRemoteFunction") {
			remote = (new MockRemoteEvent() as unknown) as RemoteEvent;
		} else if (remoteType === "RemoteFunction") {
			remote = (new MockRemoteFunction() as unknown) as RemoteFunction;
		} else {
			throw `Not yet implemented`;
		}

		remote.Name = name;
		mockRemoteCache.set(`${remoteType}~${name}`, remote);

		onCreate?.(remote as RemoteTypes[K]);
		return remote as RemoteTypes[K];
	}
}

/** @internal */
export function findOrCreateRemote<K extends keyof RemoteTypes>(
	remoteType: K,
	name: string,
	onCreate?: (instance: RemoteTypes[K]) => void,
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
		} // stfu

		remote.Name = name;
		remote.Parent = remoteFolder;

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
