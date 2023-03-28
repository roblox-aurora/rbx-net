---
id: net.server
title: Net.Server Namespace
sidebar_label: Net.Server
slug: /api/server
---

This contains all the server-related code relating to Net
## Event
```ts
class ServerEvent<ConnectArgs, CallArgs> {
    constructor(name: string, middleware?: Middleware);

    GetInstance(): RemoteEvent;

    Connect(callback: (player: Player, ...args: ConnectArgs) => void): RBXScriptConnection;

    SendToAllPlayers(...args: CallArgs): void;
    SendToAllPlayersExcept(blacklist: Player | Player[], ...args: CallArgs): void;
    SendToPlayer(player: Player, ...args: CallArgs): void;
    SendToPlayers(players: Player[], ...args: CallArgs): void;
}
```
### GetInstance
### Connect
### SendToAllPlayers
### SendToAllPlayersExcept
### SendToPlayer
### SendToPlayers

## Function
```ts
class ServerFunction<CallbackArgs, Returns> {
    constructor(name: string, middleware?: Middleware);
    
    GetInstance(): RemoteFunction;

    SetCallback(callback: (player: Player, ...args: CallbackArgs) => Returns): void;
}
```
### GetInstance
### SetCallback

## AsyncFunction
```ts
class ServerAsyncFunction<CallbackArgs, CallArgs, ClientReturnType> {
    constructor(name: string, middleware?: Middleware);

    GetInstance(): RemoteEvent;

    SetCallback(callback: (player: Player, ...args: CallbackArgs) => any): void;

    CallPlayerAsync(player: Player, ...args: CallArgs): Promise<ClientReturnType>;
}
```
### GetInstance
### SetCallback
### CallPlayerAsync

## CrossServerEvent
```ts
class CrossServerEvent {
    constructor(name: string);
    SendToAllServers(...args: unknown[]): void;
    SendToServer(jobId: string, ...args: unknown[]): void;
    SendToPlayer(userId: number, ...args: unknown[]): void;
    SendToPlayers(userIds: number[], ...args: unknown[]): void;
    Disconnect(): void;
}
```

### SendToAllServers
### SendToServer
### SendToPlayer
### SendToPlayers
### Disconnect