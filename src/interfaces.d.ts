declare interface INetEvent {}

declare interface IServerNetEvent extends INetEvent {
	SendToPlayers<T extends Array<any>>(players: Array<Player>, ...args: T): void;
	SendToPlayer<T extends Array<any>>(player: Player, ...args: T): void;
	SendToAllPlayers<T extends Array<any>>(...args: T): void;
	SendToAllPlayersExcept<T extends Array<any>>(blacklist: Player | Array<Player>, ...args: T): void;

	Connect<T extends Array<unknown>>(callback: (player: Player, ...arguments: T) => void): void;
}

declare interface IClientNetEvent extends INetEvent {
	SendToServer<T extends Array<any>>(...args: T): void;
	Connect<T extends Array<unknown>>(callback: (...arguments: T) => void): void;
}

declare interface INetXMessageEvent {
	SendToAllServers(arg: unknown): void;
	Connect(handler: (message: unknown) => void): void;
}

declare interface INetXServerEvent {
	SendToAllServers<T extends Array<unknown>>(...args: T): void;
	SendToPlayer<T extends Array<unknown>>(userId: number, ...args: T): void;
	SendToPlayers<T extends Array<unknown>>(userIds: Array<number>, ...args: T): void;
}
