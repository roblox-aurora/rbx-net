---
id: net.client
title: Net.Client Namespace
sidebar_label: Net.Client
slug: /api/client
---
This contains all the client-related code relating to Net

## Event
```ts
class ClientEvent<ConnectArgs, CallArgs> {
    constructor(name: string);
    SendToServer(...args: CallArguments): void;
    Connect(callback: (...args: ConnectArgs) => void): RBXScriptConnection;
}
```
### SendToServer
### Connect

## Function
```ts
class ClientFunction<CallArgs, ServerReturnType> {
    constructor(name: string);
    CallServerAsync(...args: CallArgs): Promise<ServerReturnType>;
}
```
### CallServerAsync

## AsyncFunction
```ts
class ClientAsyncFunction<CallbackArgs, CallArgs, ServerReturnType> {
    constructor(name: string);
    CallServerAsync(...args: CallArgs): Promise<ServerReturnType>;
    SetCallback(callback: (...args: CallbackArgs) => any): void;
    SetCallTimeout(timeout: number): void;
    GetCallTimeout(): number;
}
```
### CallServerAsync
### SetCallback
### SetCallTimeout
### GetCalllTimeout

## CrossServerEvent
```ts
class CrossServerEvent {
    constructor(name: string);
    Connect(callback: (...args: unknown[]) => void): void;
}
```
### Connect