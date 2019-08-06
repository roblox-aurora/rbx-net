/// <reference types="@rbxts/types" />
export interface RequestCounter {
    Increment(player: Player): void;
    Get(player: Player): number;
}
/** @internal */
export declare const IS_SERVER: boolean;
/** @internal */
export declare const IS_CLIENT: boolean;
/** @internal */
export declare const MAX_CLIENT_WAITFORCHILD_TIMEOUT = 10;
/** @internal */
export declare function getGlobalRemote(name: string): string;
/** @internal */
export declare function isLuaTable(value: unknown): value is Map<unknown, unknown>;
/** @internal */
export declare const ServerTickFunctions: (() => void)[];
/** @internal */
export declare function findOrCreateFolder(parent: Instance, name: string): Folder;
/**
 * Errors with variables formatted in a message
 * @param message The message
 * @param vars variables to pass to the error message
 */
export declare function errorft(message: string, vars: {
    [name: string]: unknown;
}): void;
/** @internal */
export declare function eventExists(name: string): boolean;
/** @internal */
export declare function functionExists(name: string): boolean;
/** @internal */
export declare function waitForEvent(name: string, timeOut: number): RemoteEvent | undefined;
/** @internal */
export declare function waitForFunction(name: string, timeOut: number): RemoteFunction | undefined;
/** @internal */
export declare function getRemoteFolder<K extends keyof RemoteTypes>(remoteType: K): Folder;
/** @internal */
export declare function findRemote<K extends keyof RemoteTypes>(remoteType: K, name: string): RemoteTypes[K] | undefined;
/** @internal */
export declare function getRemoteOrThrow<K extends keyof RemoteTypes>(remoteType: K, name: string): RemoteTypes[K];
/** @internal */
export declare function findOrCreateRemote<K extends keyof RemoteTypes>(remoteType: K, name: string): RemoteTypes[K];
