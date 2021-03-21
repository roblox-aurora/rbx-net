---
id: starting
title: Creating a definition
sidebar_label: Creating definitions
slug: /definitions/starting
---
import Code, { DEFAULT_VALUE, GROUP, TABS } from '@site/src/components/Code'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

In RbxNet, there are three categories of remote objects:

- **Event** - This is analogous to a `RemoteEvent`. This is what is used if you want to send an event (like an action) to the server or a player
- **AsyncFunction** - This is _like_ a `RemoteFunction`, but uses `RemoteEvent` internally. The difference with this and `Function` is that `AsyncFunction` _will_ handle time outs and runs completely asynchronously. (meaning it wont yield code) If there is no response from the reciever, it will reject.
- **Function** - This is analogous to a `RemoteFunction`. However unlike a regular `RemoteFunction` this does not allow you to call a client. This is for security reasons discussed [here](https://github.com/roblox-aurora/rbx-net/issues/13)

## Defining Events & Functions
Given the above knowledge, we can then apply that to our remote definition script. There are the following functions under `Net.Definitions` for creating definitions for the three categories we have above. The API for each type of definition is explicit so it is easy to understand what each defined remote does.

### The different types of definitions

- Event
    - **`Net.Definitions.ServerToClientEvent`** - Defines an event in which the server sends an event to one or many clients
    - **`Net.Definitions.ClientToServerEvent`** - Defines an event in which the client send events to the server
    - **`Net.Definitions.BidirectionalEvent`** - Defines an event in which both the server can send an event to one or many clients, and also the clients can send events to the server. _This should only be used in cases where it's required_.

- AsyncFunction
    - **`Net.Definitions.ServerAsyncFunction`** - Defines an async function which exists on the server, and can be called by clients. The returned result will be recieved on the client as a promise.
    <!-- - **`Net.Definitions.ClientAsyncFunction`** - Defines an async function which exists on the client, and can be called by the server. The returned result will be recieved on the server as a promise.  -->
- Function
    - **`Net.Definitions.ServerFunction`** - Defines a synchronous function which exists on the server, and can be called by clients

### Defining remotes

With the above knowledge, we can create a few example definitions. Say I would like a use case like the following

![](/img/traditional_remotes.png)

<Tabs defaultValue={DEFAULT_VALUE} groupId={GROUP} values={TABS}>
  <TabItem value="ts">

```ts title="shared/remotes.ts"
import { Definitions } from "@rbxts/net";

const Remotes = Definitions.Create({
    GetPlayerInventory: Definitions.ServerAsyncFunction<() => SerializedPlayerInventory>(),
    GetPlayerEquipped: Definitions.ServerAsyncFunction<() => SerializedPlayerEquipped>(),

    PlayerInventoryUpdated: Definitions.ServerToClientEvent<[event: InventoryUpdatedEvent]>(),
    PlayerEquippedUpdated: Definitions.ServerToClientEvent<[event: EquippedUpdatedEvent]>(),

    PlayerUnequipItem: Definitions.ClientToServerEvent<[itemId: number]>(),
    PlayerEquipItem: Definitions.ClientToServerEvent<[itemId: number]>(),
});

export = Remotes;
```

  </TabItem>
  <TabItem value="luau">

```lua title="src/shared/remotes.lua"
local Net = require(ReplicatedStorage.Net)

local Remotes = Net.Definitions.Create({
    GetPlayerInventory = Net.Definitions.ServerFunction(),
    GetPlayerEquipped = Net.Definitions.ServerFunction(),

    PlayerInventoryUpdated = Net.Definitions.ServerToClientEvent(),
    PlayerEquippedUpdated = Net.Definitions.ServerToClientEvent(),

    PlayerUnequipItem = Net.Definitions.ClientToServerEvent(),
    PlayerEquipItem = Net.Definitions.ClientToServerEvent(),
})

return Remotes
```

  </TabItem>
</Tabs>

Straight away you can see it's quite easy to know what remote does what.