---
id: definitions
title: Leveraging the Definitions API
sidebar_label: Definitions Overview
slug: /definitions
---
:::caution
The `Definitions` API is still very experimental, and subject to change.
:::

When designing your networking objects, it may become cumbersome to keep references to all your remotes all over the place.

## The standard way

You may define a remote on the server, as such:
```ts title="server/test.server.ts"
import Net from "@rbxts/net";
const PrintMessage = new Net.Server.Event<[message: string]>("PrintMessage");
const MakeHello = new Net.Server.AsyncFunction<[input: string], []>("MakeHello");

PrintMessage.Connect((message) => {
    print(message);
});
MakeHello.SetCallback((message) => `Hello, ${message}!`);
```

And then of course, a parallel client remote on the client.
```ts title="client/test.client.ts"
import Net from "@rbxts/net";
const PrintMessage = new Net.Client.Event<[], [message: string]>("PrintMessage");
const MakeHello = new Net.Client.AsyncFunction<[], [message: string], string>("MakeHello");

PrintMessage.SendToServer("Hello there!");
MakeHello.CallServerAsync("Roblox").then(result => {
    print(result); // Should be Hello, Roblox!
});
```

While this works very well, you may want a single place to reference _all_ your remote objects and handle all the types for you. As you can see above, maintaining types could get very hectic. This is where `Definitions` come in.


## Definitions, oh my!
One of the new cool features of v2.0 is the `Net.Definitions` namespace. Now we can define our remotes in a single place, rather than having to maintain separate references:

```ts title="shared/remotes.ts"
import Net from "@rbxts/net";
const Remotes = Net.Definitions.Create({
    PrintMessage: Net.Definitions.Event<[message: string]>(),
    MakeHello: Net.Definitions.AsyncFunction<(message: string) => string>()
});
export = Remotes;
```

And how do we use these in the client and server?

```ts title="server/test.server.ts"
import { Server } from "shared/remotes.ts";
const PrintMessage = Server.Create("PrintMessage")
const MakeHello = Server.Create("MakeHello")

PrintMessage.Connect((message) => {
    print(message);
});
MakeHello.SetCallback((message) => `Hello, ${message}!`);
```
```ts title="client/test.client.ts"
import { Client } from "shared/remotes.ts";
const PrintMessage = Client.Get("PrintMessage")
const MakeHello = Client.Get("MakeHello")

PrintMessage.SendToServer("Hello there!");
MakeHello.CallServerAsync("Roblox").then(result => {
    print(result); // Should be Hello, Roblox!
});
```

Simple! note the lack of needing type information outside of the definitions file. If you want to use your definitions in multiple places, you don't have to worry about your types being out of sync!