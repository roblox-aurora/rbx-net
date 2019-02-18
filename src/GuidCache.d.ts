type Guid = string;
type GuidMap = { [name: string]: Guid, [Symbol.iterator]: () => void }

interface GuidCache {
	GetIdFromName<K extends keyof RemoteTypes>(remoteType: K, name: string): Guid;
	GetOrCreateIdFromName<K extends keyof RemoteTypes>(remoteType: K, name: string): Guid;
	GetIds(): GuidMap;
	GetCount(): number;
	Lock(): void;
	readonly lock: boolean;
	readonly enabled: boolean;
	SetEnabled(enabled?: boolean): void;
}
declare const GuidCacheImpl: GuidCache;
export = GuidCacheImpl;