---
id: custom-player-objects
title: Wrapping Custom Player Objects
sidebar_label: Using custom Player objects
slug: /custom-player-objects
---
import Code, { DEFAULT_VALUE, GROUP, TABS } from '@site/src/components/Code'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## How one might do it

A common pattern when using remotes - on the server - is to require casting a player to an object representation of the player.

This may come as the following sort of situation:


<Tabs defaultValue={DEFAULT_VALUE} groupId={GROUP} values={TABS}>
  <TabItem value="ts">

```ts
import Remotes from "shared/remotes";
import PlayerService from "server/Services/PlayerService";

const PlayerEquipItem = Remotes.Server.Get("PlayerEquipItem");
PlayerEquipItem.Connect((player, itemId) => {
    const entity = PlayerService.GetEntity(player);
    if (entity) {
        entity.EquipItem(itemId);
    }
})

const PlayerUnequipItem = Remotes.Server.Get("PlayerUnequipItem")
PlayerUnequipItem.Connect((player, itemId) => {
    const entity = PlayerService.GetEntity(player);
    if (entity) {
        entity.UnequipItem(itemId);
    }
})

const GetPlayerEquipped = Remotes.Server.Get("GetPlayerEquipped")
GetPlayerEquipped.SetCallback((player) => {
    const entity = PlayerService.GetEntity(player);
    if (entity) {
        return entity.GetEquippedItems();
    }
})
```

  </TabItem>
  <TabItem value="luau">

```lua
local PlayerService = require(ServerScriptService.Services.PlayerService)
local Remotes = require(ReplicatedStorage.Remotes)

local PlayerEquipItem = Remotes.Server:Get("PlayerEquipItem")
PlayerEquipItem:Connect(function (player, itemId)
    local entity = PlayerService:GetEntity(player)
    if entity then
        entity:EquipItem(itemId)
    end
end)

local PlayerUnequipItem = Remotes.Server:Get("PlayerUnequipItem")
PlayerUnequipItem:Connect(function (player, itemId)
    local entity = PlayerService:GetEntity(player)
    if entity then
        entity:UnequipItem(itemId)
    end
end)

local GetPlayerEquipped = Remotes.Server:Get("GetPlayerEquipped")
GetPlayerEquipped:SetCallback(function(player)
    local entity = PlayerService:GetEntity(player)
    if entity then
        return entity:GetEquippedItems()
    end
end)
```

  </TabItem>
</Tabs>

As you might have noticed, there's some repeated code where we're repetitively having to grab the player entity here in place of the player.

We can instead use what's called a _wrapper_ to do this for us and make it as if we were connecting directly to the remote and it had the entity as the player argument rather than a player.

## Using a wrapper

We can define a `withPlayerEntity` wrapper, which will achieve what we're doing above in each remote separately. This is the recommended method when augmenting the player argument as it's the safest method and guaranteed to run after all the middleware.

<Tabs defaultValue={DEFAULT_VALUE} groupId={GROUP} values={TABS}>
  <TabItem value="ts">

```ts title="server/Wrappers/withPlayerEntity.ts"
import PlayerService from "server/Services/PlayerService";
import PlayerEntity from "server/Classes/PlayerEntity";

export default function withPlayerEntity<T extends Array<unknown>, R = void>(
	fn: (playerEntity: PlayerEntity, ...args: T) => R,
) {
	return (player: Player, ...args: T) => {
		const entity = PlayerService.GetEntity(player);
		if (entity) {
			return fn(entity, ...args);
		}
	};
}
```

</TabItem>
<TabItem value="luau">

```lua title="src/server/Wrappers/withPlayerEntity.lua"
local PlayerService = require(ServerScriptService.Services.PlayerService)

local function withPlayerEntity(fn)
	return function (player, ...)
		local entity = playerService:GetEntity(player)
		if entity then
			return fn(entity, ...)
		end
	end
end

return withPlayerEntity
```

</TabItem>

</Tabs>

Then we can apply this to the code above.

<Tabs defaultValue={DEFAULT_VALUE} groupId={GROUP} values={TABS}>
  <TabItem value="ts">

```ts
import PlayerService from "server/Services/PlayerService";
import Remotes from "shared/remotes";
import withPlayerEntity from "server/Wrappers/withPlayerEntity";

const PlayerEquipItem = Remotes.Server.Get("PlayerEquipItem")
PlayerEquipItem.Connect(
    withPlayerEntity((entity, itemId) => {
        entity.EquipItem(itemId);
    })
);

const PlayerUnequipItem = Remotes.Server.Get("PlayerUnequipItem")
PlayerUnequipItem.Connect((player, itemId) => {
    withPlayerEntity((entity, itemId) => {
        entity.UnequipItem(itemId);
    })
})

const GetPlayerEquipped = Remotes.Server.Get("GetPlayerEquipped")
GetPlayerEquipped.SetCallback(
    withPlayerEntity((player) => {
        return entity.GetEquippedItems();
    })
)
```

  </TabItem>
  <TabItem value="luau">

```lua
local PlayerService = require(ServerScriptService.Services.PlayerService)
local Remotes = require(ReplicatedStorage.Remotes)
local withPlayerEntity = require(ServerScriptService.Wrappers.withPlayerEntity)

local PlayerEquipItem = Remotes.Server:Get("PlayerEquipItem")
PlayerEquipItem:Connect(
    withPlayerEntity(function (entity, itemId)
        entity:EquipItem(itemId)
    end)
)

local PlayerUnequipItem = Remotes.Server:Get("PlayerUnequipItem")
PlayerUnequipItem:Connect(
    withPlayerEntity(function (player, itemId)
        entity:UnequipItem(itemId)
    end)
)

local GetPlayerEquipped = Remotes.Server:Get("GetPlayerEquipped")
GetPlayerEquipped:SetCallback(
    withPlayerEntity(function(player)
        return entity:GetEquippedItems()
    end)
)
```

  </TabItem>
</Tabs>

And as you can see, this reduces repetitive code and gives us the `PlayerEntity` object to work with. Simple as that.