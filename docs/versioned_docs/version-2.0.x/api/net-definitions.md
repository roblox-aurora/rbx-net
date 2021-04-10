---
id: net.definitions
title: Net.Definitions Namespace
sidebar_label: Net.Definitions
slug: /api/definitions
---

This namespace is for the Definitions feature.

### Create(definitions)
```ts
function Create<T extends RemoteDeclarations>(remotes: T): DefinitionBuilders<T>
```


Function
- Parameters
    - `remotes` An object of remote definitions. See [definitions](../definitions#definitions-oh-my) for usage.
- Returns a [DefinitionBuilders](#definitionbuilderst)

Example
```ts title="shared/remotes.ts"
import Net from "@rbxts/net";
const MyDefinitions = Net.Definitions.Create({
    TestRemote: Net.Definitions.AsyncFunction<(name: string) => boolean>()
});
```



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

## DefinitionsCreateResult&lt;T&gt;
Contains the definition builders for a given definition (returned using [`Create`](definitions#createdefinitions) in Net.Definitions)

```ts
interface DefinitionsCreateResult<T extends RemoteDeclarations> {
    readonly Server: ServerDefinitionBuilder<T>;
    readonly Client: ClientDefinitionBuilder<T>;
}
```

### Server
A [ServerDefinitionBuilder](definitions#serverdefinitionbuildert) object.
### Client
A [ClientDefinitionBuilder](definitions#clientdefinitionbuildert) object.

<!-- 
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
``` -->

## ServerDefinitionBuilder&lt;T&gt;
Contains all the definition builders for server-side events and functions.

```ts
class ServerDefinitionBuilder<T extends RemoteDeclaration> {
    Create(name: string): ServerEvent | ServerAsyncFunction | ServerFunction;
    ConnectEvent(name: string, callback: Callback): void;
}
```


### Create(name)
Will get the specified event by name, and return it. The returned object will be the type provided in the definition.

```ts title="server/example.server.ts"
import { Server as ServerRemotes } from "shared/remotes.ts";
const TestRemote = ServerRemotes.Create("TestRemote");
```

### ConnectEvent(name, callback)
Similar to `Create` but only works on events, and is pretty much a shortcut for `Create(name).Connect(callback)`
## ClientDefinitionBuilder&lt;T&gt;
Contains all the definition builders for server-side events and functions.

```ts
class ClientDefinitionBuilder<T extends RemoteDeclaration> {
    Get(name: string): ServerEvent | ServerAsyncFunction | ServerFunction;
    ConnectEvent(name: string, callback: Callback): void;
}
```
### Get(name)
Will get the specified event by name, and return it. The returned object will be the type provided in the definition.

Gets the specified remote definition and gets the client version of the event/function/asyncfunction

```ts title="client/example.client.ts"
import { Client as ClientRemotes } from "shared/remotes.ts";
const TestRemote = ClientRemotes.Get("TestRemote");
```

### ConnectEvent(name, callback)
Similar to `Get` but only works on events, and is pretty much a shortcut for `Create(name).Connect(callback)`