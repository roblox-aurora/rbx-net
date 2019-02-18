type Guid = string;
type GuidMap = { [name: string]: Guid, [Symbol.iterator]: () => void }

interface GuidCache {
	GetIdFromName(name: string): string;
	GetOrCreateIdFromName(name: string): string;
	GetIds(): GuidMap;
	GetCount(): number;
	readonly enabled: boolean;
	SetEnabled(enabled?: boolean): void;
}
declare const GuidCacheImpl: GuidCache;
export = GuidCacheImpl;