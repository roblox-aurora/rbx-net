interface RequestCounter {
	Increment(player: Player): void;
	Get(player: Player): number;
	ClearAll(): void;
}

interface ThrottleSystem {
	Get(name: string): RequestCounter;
	Clear(): void;
}
declare const ThrottleImpl: ThrottleSystem;
export = ThrottleImpl;
