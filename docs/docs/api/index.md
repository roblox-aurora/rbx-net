---
id: api
title: API Overview
sidebar_label: Overview
slug: /api
---

:::caution Alpha Build
This is currently an alpha build of Net. The API is subject to change.
:::

## Net.Server
This contains all the server-related code relating to Net
### Event
```ts
class Event
```
### Function
```ts
class Function
```
### AsyncFunction
```ts
class AsyncFunction
```
### CrossServerEvent
```ts
class CrossServerEvent
```

## Net.Client
This contains all the client-related code relating to Net

### Event
```ts
class Event
```
### Function
```ts
class Function
```
### AsyncFunction
```ts
class AsyncFunction
```
### CrossServerEvent
```ts
class CrossServerEvent
```

## Net.Definitions
This namespace is for the Definitions feature.

### Create(definitions)
```ts
function Create<T extends RemoteDeclarations>(remotes: T): DefinitionBuilder<T>
```
see [DefinitionBuilder](#definitionbuildert)


### Function&lt;Server&gt;(...)
Definition function for creating a `FunctionDefinition`
### Event&lt;ServerArgs, ClientArgs&gt;(...)
Definition function for creating an `EventDefinition`
### AsyncFunction&lt;Server, Client&gt;(...)
Definition function for creating an `AsyncDefinition`

## Net.Middleware
This namespace contains built-in middleware for RbxNet.

### RateLimit(limit)
### RuntimeTypeCheck(...typeCheckers)

## DefinitionBuilder&lt;T&gt;
```ts
class DefinitionBuilder<T extends RemoteDeclarations> {
    GetAllClient(): ClientBuildResult<T>;
    GetClient(name: keyof T): ClientEvent | ClientAsyncFunction | ClientFunction;
    CreateAllServer(): ServerBuildResult<T>;
    CreateServer(name: keyof T): ClientEvent | ClientAsyncFunction | ClientFunction;
}
```

#### Example Usage

The definitions should be placed in a shared file:

```ts title="shared/remotes.ts"
import Net from "@rbxts/net";
const MyDefinitions = Net.Definitions.Create({
    TestRemote: Net.Definitions.AsyncFunction<(name: string) => boolean>()
});
```


### GetClient(name)
Gets the specified remote definition and gets the client version of the event/function/asyncfunction

```ts title="client/example.client.ts"
import MyDefinitions from "shared/remotes.ts";
const TestRemote = MyDefinitions.GetClient("TestRemote");
```

### CreateServer(name)
Creates the specified remote definition on the server

```ts title="server/example.server.ts"
import MyDefinitions from "shared/remotes.ts";
const TestRemote = MyDefinitions.CreateServer("TestRemote");
```