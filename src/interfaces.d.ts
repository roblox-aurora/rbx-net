declare interface INetEvent {}

declare interface IServerNetEvent extends INetEvent {
	SendToPlayers(players: Array<Player>, ...args: any[]): void;
	SendToPlayer(player: Player, ...args: any[]): void;
	SendToAllPlayers(...args: any[]): void;
	SendToAllPlayersExcept(blacklist: Player | Array<Player>, ...args: any[]): void;

	Connect(callback: (player: Player, ...arguments: any[]) => void): void;
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
