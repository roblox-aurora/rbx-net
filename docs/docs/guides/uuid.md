---
id: uuid
title: Using Compile Time Remote IDs
sidebar_label: Compile-time Remote IDs
slug: /uuid
---
:::info TypeScript Only
This functionality is only available to roblox-ts users. This is not possible in regular Luau.
:::

This method uses a transformer called [`rbxts-transform-guid`](https://github.com/roblox-aurora/rbxts-transform-guid) and is quite experimental.

## Installation 

```bash
npm i -D rbxts-transform-guid
```

Once installed, you will need to configure it in your tsconfig.json under `plugins`:

```json
{
	"compilerOptions": {
        // ..
        "plugins": [
            // ...
            {
				"transform": "rbxts-transform-env",
				"EXPERIMENTAL_JSDocConstEnumUUID": true
			}
        ]
    }
}
```

Then if you want to create remote ids, you create a `const enum` like such:

```ts
/**
 * @uuid
 */
export const enum RemoteId {
    GetPlayerInventory = "GetPlayerInventory"
}
```

`uuid` is important here, it's what tells our transformer to convert our enum values to guids at compile time.

Then in your definition file you can use it as such:

```ts title="src/shared/remotes.ts"
import Net from "@rbxts/net";

/**
 * @uuid
 */
export const enum RemoteId {
    GetPlayerInventory = "GetPlayerInventory"
}

const Remotes = Net.CreateDefinitions({
    [RemoteId.GetPlayerInventory]: Net.Definitions.ServerAsyncFunction<() => InventorySlot[]>(),
});

export default Remotes;
```

Then you can use it as such:

```ts title="src/server/example.server.ts"
import Remotes, { RemoteId } from "src/shared/remotes";

const getPlayerInventory = Remotes.Server.Get(RemoteId.GetPlayerInventory);
// ...
```