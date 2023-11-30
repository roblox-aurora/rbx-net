---
id: starting
title: Creating a definition
sidebar_label: Creating definitions
slug: /definitions/starting
---
import Code, { DEFAULT_VALUE, GROUP, TABS } from '@site/src/components/Code'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

In RbxNet, there are five categories of remote objects:

- **Event** - This is analogous to a `RemoteEvent`. This is what is used if you want to send an event (like an action) to the server or a player.
- **UnreliableEvent** - This is analogous to `UnreliableRemoteEvent`. Similar to RemoteEvent - however not guaranteed to be recieved.
- **AsyncFunction** - This is _like_ a `RemoteFunction`, but uses `RemoteEvent` internally. The difference with this and `Function` is that `AsyncFunction` _will_ handle time outs and runs completely asynchronously. (meaning it wont yield code) If there is no response from the reciever, it will reject.
- **Function** - This is analogous to a `RemoteFunction`. However unlike a regular `RemoteFunction` this does not allow you to call a client. This is for security reasons discussed [here](https://github.com/roblox-aurora/rbx-net/issues/13)
- [**ExperienceBroadcastEvent**](#todo) - This uses `MessagingService` to send an event to all servers in an experience

## Defining Events & Functions
Given the above knowledge, we can then apply that to our remote definition script. The basic way of defining a remote is through the `Net.Remote` function - which will return a builder we can use to further define the shape of our remote object.

- Event: `Net.Remote()`
- AsyncFunction: `Net.Remote( ...argumentTypeChecks ).WhichReturnsAsync( returnTypeCheck )`
- Function: `Net.Remote( ...argumentTypeChecks ).WhichReturnsSync( returnTypeCheck )` (only works with server-owned)
- UnreliableEvent: `Net.UnreliableRemote(...argumentTypeChecks)` or `Net.Remote(...argumentTypes).AsUnreliable()`
- ExperienceBroadcastEvent: `Net.Broadcaster(argumentTypeCheck)`

### Defining remotes

With the above knowledge, we can create a few example definitions. Say I would like a use case like the following

![](/img/traditional_remotes.png)

<Tabs defaultValue={DEFAULT_VALUE} groupId={GROUP} values={TABS}>
  <TabItem value="ts">

```ts title="shared/remotes.ts"
import Net, { Definitions } from "@rbxts/net";
import t from "@rbxts/t";

const Remotes = Net.BuildDefinition()
  // Server async functions
  .AddServerOwned("GetPlayerInventory", Net.Remote().WhichReturnsAsync<SerializedPlayerInventory>())
  .AddServerOwned("GetPlayerEquipped", Net.Remote().WhichReturnsAsync<SerializedPlayerEquipped>())
  // Server events
  .AddServerOwned("PlayerInventoryUpdated", Net.Remote<[event: InventoryUpdatedEvent]>(InventoryUpdatedEvent))
  .AddServerOwned("PlayerEquippedUpdated", Net.Remote<[event: InventoryUpdatedEvent]>(EquippedUpdatedEvent))
  // Client events
  .AddClientOwned("PlayerUnequipItem", Net.Remote<[itemId: number]>(t.number))
  .AddClientOwned("PlayerEquipItem", Net.Remote<[itemId: number]>(t.number))
  .Build();

export = Remotes;
```

  </TabItem>
  <TabItem value="luau">

```lua title="src/shared/remotes.lua"
local Net = require(ReplicatedStorage.Net)
local t = require(ReplicatedStorage.t)

local Remotes = Net.BuildDefinition()
  -- Server async functions
  :AddServerOwned("GetPlayerInventory", Net.Remote():WhichReturnsAsync(SerializedPlayerInventory))
  :AddServerOwned("GetPlayerEquipped", Net.Remote():WhichReturnsAsync(SerializedPlayerEquipped))
  -- Server events
  :AddServerOwned("PlayerInventoryUpdated", Net.Remote(InventoryUpdatedEvent))
  :AddServerOwned("PlayerEquippedUpdated", Net.Remote(EquippedUpdatedEvent))
  -- Client events
  :AddClientOwned("PlayerUnequipItem", Net.Remote(t.number))
  :AddClientOwned("PlayerEquipItem", Net.Remote(t.number))
  :Build();

return Remotes
```

  </TabItem>
</Tabs>

You may notice that we have `SerializedPlayerInventory`, `SerializedPlayerEquipped`, `InventoryUpdatedEvent` and `EquippedUpdatedEvent`. These are [_type guards_](#guards). By using these, we ensure that our networking objects send and recieve the correct types! - this is especially useful at runtime when malicious clients could send incorrect data.