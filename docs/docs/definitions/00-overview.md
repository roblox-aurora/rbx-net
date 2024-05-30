---
id: overview
title: Getting Started
sidebar_label: Getting Started
slug: /NOM/getting-started
---
import Code, { DEFAULT_VALUE, GROUP, TABS } from '@site/src/components/Code'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is a Network Object Model? (NOM) 🐹
The Network Object Model is a sort of "blueprint" for all the networking related objects in your game or library.

It's a single source of truth in which all the code in your game can access remotes through, to handle your game or library's networking.

## Creating the NOM
<!-- To use definitions, you will need to create a script that is somewhere in `ReplicatedStorage` (or inside the library itself if you're doing it for a library). It needs to be accessible by both server scripts and client scripts.

The basic declaration of a definition script, is the following: -->

The main way to declare a NOM is to create a root-level [namespace](../API/Namespace):

<Tabs defaultValue={DEFAULT_VALUE} groupId={GROUP} values={TABS}>
  <TabItem value="ts">

```ts title="shared/remotes.ts"
import Net from "@rbxts/net";

const Remotes = Net.BuildDefinition()
  .Build();

export = Remotes;
```

  </TabItem>
  <TabItem value="luau">

```lua title="src/shared/remotes.lua"
local Net = require(ReplicatedStorage.Net)

local Remotes = Net.BuildDefinition()
  :Build()

return Remotes
```

  </TabItem>
</Tabs>

- `Net.BuildDefinition()` gives us a NOM builder
  - The functions on this are what we'll use to add network objects!
- `Build()` is how we turn the model into objects we can use.

## Contexts

With the returned `Remotes` result - we can access either the _`Server`_ or _`Client`_ contexts (via `Remotes.Server` or `Remotes.Client`)

It's recommended that you create files on the server and client for this:

<Tabs defaultValue={DEFAULT_VALUE} groupId={GROUP} values={TABS}>
  <TabItem value="ts">

```ts title="server/remotes.ts"
import Remotes from "shared/remotes";
import ServerRemotes = Remotes.Server;
export = ServerRemotes;
```

  </TabItem>
  <TabItem value="luau">

```lua title="src/server/remotes.lua"
local Remotes = require(ReplicatedStorage.Remotes)
return Remotes.Server
```

  </TabItem>
</Tabs>


<Tabs defaultValue={DEFAULT_VALUE} groupId={GROUP} values={TABS}>
  <TabItem value="ts">

```ts title="client/remotes.ts"
import Remotes from "shared/remotes";
import ClientRemotes = Remotes.Client;
export = ClientRemotes;
```

  </TabItem>
  <TabItem value="luau">

```lua title="src/client/remotes.lua"
local Remotes = require(ReplicatedStorage.Remotes)
return Remotes.Client
```

  </TabItem>
</Tabs>