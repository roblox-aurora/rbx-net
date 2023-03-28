---
id: overview
title: Getting started
sidebar_label: Getting started
slug: /definitions
---
import Code, { DEFAULT_VALUE, GROUP, TABS } from '@site/src/components/Code'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<!-- Below is an example of a traditional sort of structure a roblox game might have with remotes

![](/img/traditional_remotes.png) -->


## What are definitions?
Definitions are a sort of "blueprint" for all the networking related objects in your game or library.

It's a single source of truth in which all the code in your game can access remotes through, to handle your game or library's networking.

## Creating a definition script
To use definitions, you will need to create a script that is somewhere in `ReplicatedStorage` (or inside the library itself if you're doing it for a library). It needs to be accessible by both server scripts and client scripts.

The basic declaration of a definition script, is the following:

<Tabs defaultValue={DEFAULT_VALUE} groupId={GROUP} values={TABS}>
  <TabItem value="ts">

```ts title="shared/remotes.ts"
import Net from "@rbxts/net";

const Remotes = Net.CreateDefinitions({
    // Definitions for the actual remotes will go here
});

export = Remotes;
```

  </TabItem>
  <TabItem value="luau">

```lua title="src/shared/remotes.lua"
local Net = require(ReplicatedStorage.Net)

local Remotes = Net.CreateDefinitions({
    -- Definitions for the actual remotes will go here
})

return Remotes
```

  </TabItem>
</Tabs>

Then simply, you can import the module from your code, and use the definitions API to get the remotes