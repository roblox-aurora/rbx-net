---
id: namespacing
title: Using namespaces
sidebar_label: Namespacing
slug: /definitions/namespacing
---
import Code, { DEFAULT_VALUE, GROUP, TABS } from '@site/src/components/Code'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


As your game grows, so too will your definitions file. To better organize your networking definitions, RbxNet introduces a concept called "Namespaces".

Namespaces are like sub-definitions. They can also be stored in separate files to be included in the main definition file.

## Creating a namespace
Going by our previous example, say we want to separate up inventory and equipment remotes into separate files:

<Tabs defaultValue={DEFAULT_VALUE} groupId={GROUP} values={TABS}>
  <TabItem value="ts">

```ts title="shared/remotes.ts"
import { Definitions } from "@rbxts/net";

const Remotes = Definitions.Create({
    // These are all remotes relating to the inventory
    Inventory: Definitions.Namespace({
        GetPlayerInventory: Definitions.ServerAsyncFunction<() => SerializedPlayerInventory>(),
        PlayerInventoryUpdated: Definitions.ServerToClientEvent<[event: InventoryUpdatedEvent]>(),
    }),

    // These are all the remotes relating to equipping
    Equipping: Definitions.Namespace({
        GetPlayerEquipped: Definitions.ServerAsyncFunction<() => SerializedPlayerEquipped>(),
        PlayerEquippedUpdated: Definitions.ServerToClientEvent<[event: EquippedUpdatedEvent]>(),
        PlayerUnequipItem: Definitions.ClientToServerEvent<[itemId: number]>(),
        PlayerEquipItem: Definitions.ClientToServerEvent<[itemId: number]>(),
    })
});

export = Remotes;
```

  </TabItem>
  <TabItem value="luau">

```lua title="src/shared/remotes.lua"
local Net = require(ReplicatedStorage.Net)

local Remotes = Net.Definitions.Create({
    -- These are all remotes relating to the inventory
    Inventory = Net.Definitions.Namespace({
        PlayerInventoryUpdated = Net.Definitions.ServerToClientEvent(),
        GetPlayerInventory = Net.Definitions.ServerFunction(),
    }),
    
    -- These are all the remotes relating to equipping
    Equipped = Net.Definitions.Namespace({
        GetPlayerEquipped = Net.Definitions.ServerFunction(),
        PlayerEquippedUpdated = Net.Definitions.ServerToClientEvent(),
        PlayerUnequipItem = Net.Definitions.ClientToServerEvent(),
        PlayerEquipItem = Net.Definitions.ClientToServerEvent(),
    }),
})

return Remotes
```

  </TabItem>
</Tabs>

Then simply, if you want to do the same fetch:

## Usage from the server
<Tabs defaultValue={DEFAULT_VALUE} groupId={GROUP} values={TABS}>
  <TabItem value="ts">

```ts title="server/main.server.ts"
import Remotes from "shared/remotes";

// This will contain all the server inventory remotes
const InventoryRemotes = Remotes.Server.GetNamespace("Inventory");

// This will contain all the server equipped remotes
const equippedRemotes = Remotes.Server.GetNamespace("Equipped");
```

  </TabItem>
  <TabItem value="luau">

```lua title="src/server/main.server.lua"
local Remotes = require(ReplicatedStorage.Shared.Remotes)

-- This will contain all the server inventory remotes
local EquippedRemotes = Remotes.Server:GetNamespace("Equipped")

-- This will contain all the client inventory remotes
local InventoryRemotes = Remotes.Server:GetNamespace("Inventory")
```

  </TabItem>
</Tabs>