---
id: net.definitions
title: Net.Definitions Namespace
sidebar_label: Net.Definitions
slug: /api/definitions
---

This namespace is for the Definitions feature.

### Definitions.Create(definitions)
```ts
function Create<T extends RemoteDeclarations>(
    remotes: T,
    globalMiddleware?: Net.GlobalMiddleware
): DefinitionBuilders<T>
```


Function
- Parameters
    - `remotes` An object of remote definitions. See [definitions](../definitions#definitions-oh-my) for usage.
    - `globalMiddleware` (optional) A collection of _global middleware_ to apply to all remotes in this definition
- Returns a [DefinitionsCreateResult](#definitionscreateresultt)

Example
```ts title="shared/remotes.ts"
import Net from "@rbxts/net";
const MyDefinitions = Net.Definitions.Create({
    TestRemote: Net.Definitions.AsyncFunction<(name: string) => boolean>()
});
```



### Definitions.ServerFunction&lt;Server&gt;(...)
Definition function for creating a `FunctionDefinition`
<!-- ### Event&lt;ServerArgs, ClientArgs&gt;(...)
Definition function for creating an `EventDefinition` -->
### Definitions.ServerToClientEvent&lt;ServerArgs&gt;(...)
Definition function for creating an `ServerEventDeclaration`
### Definitions.ClientToServerEvent&lt;ClientArgs&gt;(...)
Definition function for creating an `ClientEventDeclaration`
### Definitions.BidirectionalEvent&lt;ServerArgs, ClientArgs&gt;(...)
Definition function for creating an `BidirectionalEventDeclaration`
### Definitions.ServerAsyncFunction&lt;Server&gt;(...)
Definition function for creating an `ServerAsyncFunctionDefinition`
### Definitions.Namespace(definitions)
Creates a group of definitions (returns `DeclarationNamespace`)

## DefinitionsCreateResult&lt;T&gt;
Contains the definition builders for a given definition (returned using [`Create`](definitions#definitionscreatedefinitions) in Net.Definitions)

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

## ServerDefinitionBuilder&lt;T&gt;
Contains all the definition builders for server-side events and functions.

```ts
class ServerDefinitionBuilder<T extends RemoteDeclaration> {
    Get(name: string): ServerEvent | ServerAsyncFunction | ServerFunction;
    GetNamespace<K extends string>(name: K): SeverDefinitionBuilder<T[K]>;
    OnEvent(name: string, callback: Callback): void;
    OnFunction(name: string, callback: Callback): void;
}
```


### Get(name)
Will get the specified event by name, and return it. The returned object will be the type provided in the definition.

```ts title="server/example.server.ts"
import { Server as ServerRemotes } from "shared/remotes.ts";
const TestRemote = ServerRemotes.Get("TestRemote");
```

### OnFunction(name, callback)
Similar to `Get` but only works on events, and is pretty much a shortcut for `Get(name).SetCallback(callback)`
### OnEvent(name, callback)
Similar to `Get` but only works on events, and is pretty much a shortcut for `Get(name).Connect(callback)`
### GetNamespace(name)
Gets a child namespace under this namespace

## ClientDefinitionBuilder&lt;T&gt;
Contains all the definition builders for server-side events and functions.

```ts
class ClientDefinitionBuilder<T extends RemoteDeclaration> {
    Get(name: string): ServerEvent | ServerAsyncFunction | ServerFunction;
    GetNamespace<K extends string>(name: K): ClientDefinitionBuilder<T[K]>;
    OnEvent(name: string, callback: Callback): void;
    OnFunction(name: string, callback: Callback): void;
}
```
### Get(name)
Will get the specified event by name, and return it. The returned object will be the type provided in the definition.

Gets the specified remote definition and gets the client version of the event/function/asyncfunction

```ts title="client/example.client.ts"
import { Client as ClientRemotes } from "shared/remotes.ts";
const TestRemote = ClientRemotes.Get("TestRemote");
```

### OnEvent(name, callback)
Similar to `Get` but only works on events, and is pretty much a shortcut for `Get(name).Connect(callback)`

### OnFunction(name, callback)
Similar to `Get` but only works on events, and is pretty much a shortcut for `Get(name).SetCallback(callback)`

### GetNamespace(name)
Gets a child namespace under this namespace