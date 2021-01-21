---
id: definitions
title: Leveraging the Definitions API
sidebar_label: Definitions Overview
slug: /definitions
---
import Code, { DEFAULT_VALUE, GROUP, TABS } from '@site/src/components/Code'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::caution
The `Definitions` API is still very experimental, and subject to change.
:::

When designing your networking objects, it may become cumbersome to keep references to all your remotes all over the place.

## The standard way

You may define a remote on the server, as such:

<Code>

```ts title="server/test.server.ts"
import Net from "@rbxts/net";
const PrintMessage = new Net.Server.Event<[message: string]>("PrintMessage");
const MakeHello = new Net.Server.AsyncFunction<[input: string], []>("MakeHello");

PrintMessage.Connect((message) => {
    print(message);
});
MakeHello.SetCallback((message) => `Hello, ${message}!`);
```

```lua title="server/test.server.lua"
local Net = require(ReplicatedStorage.Net)
local PrintMessage = Net.Server.Event.new("PrintMessage");
local MakeHello = Net.Server.AsyncFunction.new("MakeHello");

PrintMessage:Connect(function(message)
    print(message)
end)
MakeHello:SetCallback(function(message)
  return "Hello, " .. message .. "!")
end)
```

</Code>

And then of course, a parallel client remote on the client.

<Code>

```ts title="client/test.client.ts"
import Net from "@rbxts/net";
const PrintMessage = new Net.Client.Event<[], [message: string]>("PrintMessage");
const MakeHello = new Net.Client.AsyncFunction<[], [message: string], string>("MakeHello");

PrintMessage.SendToServer("Hello there!");
MakeHello.CallServerAsync("Roblox").then(result => {
    print(result); // Should be Hello, Roblox!
});
```

```lua title="client/test.client.ts"
local Net = require(ReplicatedStorage.Net)
local PrintMessage = Net.Client.Event.new("PrintMessage")
local MakeHello = Net.Client.AsyncFunction.new("MakeHello")

PrintMessage:SendToServer("Hello there!")
MakeHello:CallServerAsync("Roblox"):andThen(function(result)
    print(result) --  Should be Hello, Roblox!
end)
```

</Code>

While this works very well, you may want a single place to reference _all_ your remote objects and handle all the types for you. As you can see above, maintaining types could get very hectic. This is where `Definitions` come in.


## Definitions, oh my!
One of the new cool features of v2.0 is the [Net.Definitions](api/definitions) namespace. Now we can define our remotes in a single place, rather than having to maintain separate references:

<Tabs defaultValue={DEFAULT_VALUE} groupId={GROUP} values={TABS}>
  <TabItem value="ts">

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
const PrintMessage = Remotes.Server.Create("PrintMessage");
PrintMessage.Connect((player, message, other) => {
  print(`Server recieved message: ${message} from player: ${player} ${other}`);
});

// listen and respond to messages
const MakeHello = Remotes.Server.Create("MakeHello");
MakeHello.SetCallback((player, message) => {
  print(`Server got an async message from ${player} containing the message ${message}`);
  return `Hello, ${player}! We got your message: ${message}`;
});
```
```ts title="client/test.client.ts"
import { Remotes } from "shared/remotes";

// send a message to the server
const PrintMessage = Remotes.Client.Get("PrintMessage");
PrintMessage.SendToServer("Hello there!", "other");

// send a message to the server, while listening for a response
const MakeHello = Remotes.Client.Get("MakeHello");
MakeHello.CallServerAsync("Net is cool right??").then((result) => {
  print(`Client got a response to the async message from server: ${result}`);
});
```

  </TabItem>
  <TabItem value="luau">

```lua title="src/shared/remotes.lua"
local Net = require(ReplicatedStorage.Net)

local Remotes = Net.Definitions.Create({
  PrintMessage = Net.Definitions.Event(),
  MakeHello = Net.Definitions.AsyncFunction(),
})

return Remotes
```

And how do we use these in the client and server?

```lua title="src/server/test.server.lua"
local Remotes = require(ReplicatedStorage.Common.Remotes)

-- listen to messages
local PrintMessage = Remotes.Server:Create("PrintMessage")
PrintMessage:Connect(function (player, message, other)
  print("Server recieved message: ", message, "from player:" ,player, other)
end)

-- listen and respond to messages
local MakeHello = Remotes.Server:Create("MakeHello")
MakeHello:SetCallback(function(player, message)
  print("Server got an async message from ", player, " containing the message ", message)
  return "Hello, " .. tostring(player) .. "! We got your message: " .. message
end)
```
```lua title="client/test.client.lua"
local Remotes = require(ReplicatedStorage.Common.Remotes)

-- send a message to the server
local PrintMessage = Remotes.Client:Get("PrintMessage");
PrintMessage:SendToServer("Hello there!", "other");

-- send a message to the server, while listening for a response
local MakeHello = Remotes.Client:Get("MakeHello")
MakeHello:CallServerAsync("Net is cool right??"):andThen(function(result)
  print("Client got a response to the async message from server", result)
end)
```

  </TabItem>
</Tabs>

Simple! note the lack of needing type information outside of the definitions file. If you want to use your definitions in multiple places, you don't have to worry about your types being out of sync!