---
id: basics
title: Basics
sidebar_label: Basics*
slug: /basic-usage
---

## Quick Start
Three files are needed to get started:

```ts title="shared/remotes.ts"
import Net from "@rbxts/net";

const Remotes = Net.Definitions.Create({
  PrintMessage: Net.Definitions.Event<[message: string, other: string]>(),
  MakeHello: Net.Definitions.AsyncFunction<(message: string) => string>(),
});

export { Remotes };
```

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

And away you go - just get editing the remotes file to add your own definitions!