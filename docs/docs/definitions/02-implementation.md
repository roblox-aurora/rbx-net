---
id: implementing
title: Using your definitions
sidebar_label: Using definitions
slug: /definitions/using
---
import Code, { DEFAULT_VALUE, GROUP, TABS } from '@site/src/components/Code'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Say that we have our example definition file here:

<Tabs defaultValue={DEFAULT_VALUE} groupId={GROUP} values={TABS}>
  <TabItem value="ts">

```ts title="shared/remotes.ts"
import Net, { Definitions } from "@rbxts/net";

const Remotes = Net.CreateDefinitions({
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

local Remotes = Net.CreateDefinitions({
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

How would we approach using this to actually be able to send messages between the server and client?

## Usage from the server
<Tabs defaultValue={DEFAULT_VALUE} groupId={GROUP} values={TABS}>
  <TabItem value="ts">

```ts title="server/main.server.ts"
import Remotes from "shared/remotes";
```

  </TabItem>
  <TabItem value="luau">

```lua title="src/server/main.server.lua"
local Remotes = require(ReplicatedStorage.Shared.Remotes)
```

  </TabItem>
</Tabs>