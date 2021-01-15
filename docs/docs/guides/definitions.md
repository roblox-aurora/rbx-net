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
One of the new cool features of v2.0 is the [Net.Definitions](api/definitions) namespace. Now we can define our remotes in a single place, rather than having to maintain separate references:

```ts title="shared/remotes.ts"
import Net from "@rbxts/net";

const Remotes = Net.Definitions.Create({
  PrintMessage: Net.Definitions.Event<[message: string, other: string]>(),
  MakeHello: Net.Definitions.AsyncFunction<(message: string) => string>(),
});

export { Remotes };
```

And how do we use these in the client and server?

```ts title="server/test.server.ts"
import { Remotes } from "shared/remotes";

// listen to messages
const PrintMessage = Remotes.CreateServer("PrintMessage");
PrintMessage.Connect((player, message, other) => {
  print(`Server recieved message: ${message} from player: ${player} ${other}`);
});

// listen and respond to messages
const MakeHello = Remotes.CreateServer("MakeHello");
MakeHello.SetCallback((player, message) => {
  print(`Server got an async message from ${player} containing the message ${message}`);
  return `Hello, ${player}! We got your message: ${message}`;
});
```
```ts title="client/test.client.ts"
import { Remotes } from "shared/remotes";

// send a message to the server
const PrintMessage = Remotes.GetClient("PrintMessage");
PrintMessage.SendToServer("Hello there!", "other");

// send a message to the server, while listening for a response
const MakeHello = Remotes.GetClient("MakeHello");
MakeHello.CallServerAsync("Net is cool right??").then((result) => {
  print(`Client got a response to the async message from server: ${result}`);
});
```

Simple! note the lack of needing type information outside of the definitions file. If you want to use your definitions in multiple places, you don't have to worry about your types being out of sync!