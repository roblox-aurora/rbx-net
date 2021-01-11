---
id: uuid
title: Using Compile Time Remote IDs
sidebar_label: Compile-time Remote IDs
slug: /uuid
---
:::info TypeScript Only
This functionality is only available to roblox-ts users. This is not possible in regular Luau.
:::


A feature that can be leveraged with the power of the roblox-ts compiler, is a thing referred to as "Remote Ids". This is a way to throw off any identifying information about your remotes to any external parties. 

If used correctly it should make it quite hard to make exploit tools for your game, and throw off most exploiters.

:::caution
It is not an anti-exploit solution, but a [good piece of cheese](https://utkusen.com/blog/security-by-obscurity-is-underrated.html) in preventing exploits. You _should always_ secure your remotes yourself, using things like the [runtime type checking middleware](/docs/2.x/middleware/types). Doesn't hurt to add another layer of cheese.
:::


## Getting started
To start using Remote Ids, first install the Remote Id generation tool:

```bash
npm install -g roblox-ts-net-idgen
```

Then, create a new `remoteIds.id.json` file inside your project. It doesn't have to be called `remoteIds`, but for this example that's what we're doing. As long as it ends with `.id.json`.

```json title="shared/remoteIds.id.json"
{
    "Name": "RemoteId",
    "IDs": [
    ]
}
```

The `Name` field is the outputted name of the `const enum`, and the `IDs` will be the IDs you have for your remotes.


Now lets add some example remote ids
```json title="shared/remoteIds.id.json"
{
    "Name": "RemoteId",
    "IDs": [
        "PrintMessage",
        "MakeHello"
    ]
}
```

Now that we have some remote ids, we need to generate the `type declaration` file. Run the command in your console:

```bash
rbxnid
```

A new `remoteId.d.ts` file should have been generated, and should look like the following:
```ts title="shared/remoteId.d.ts"
export const enum RemoteId {
    PrintMessage = "cbf11f23-ed6e-43f6-8750-fce7c6558ae4",
    MakeHello = "ffa61bfe-d8ba-4c82-a7eb-3dd36b133184"
}
```

These IDs will change every time you run the `rbxnid` command. It's recommended you do this as part of your build process, so each new build of your game has an entirely new set of IDs. This will ensure that it's difficult to make any specific exploit tools for your game.

## Usage

Then when you have the RemoteIds, you can use them in place where you'd normally supply a remote id:

```ts
import Net from "@rbxts/net";
import { RemoteId } from "shared/remoteId";

const ExampleUsage = new Net.Server.Event(RemoteId.PrintMessage); 
```

This will end up compiling to
```lua title="compiled code"
--- ... roblox-ts imports
local ExampleUsage = Net.Server.Event.new("cbf11f23-ed6e-43f6-8750-fce7c6558ae4")
```

### Using with Definitions

Using remote ids with definitions is straightforward.

```ts
import Net from "@rbxts/net";
import { RemoteId } from "shared/remoteId";

const Remotes = Net.Definitions.Create({
    [RemoteId.PrintMessage]: Net.Definitions.Event<[message: string]>(),
    [RemoteId.MakeHello]: Net.Definitions.AsyncFunction<(message: string) => string>()
});
export = Remotes;
```

Which should compile to the following:
```lua title="compiled code"
-- ... roblox-ts imports
local Remotes = Net.Definitions.Create({
    ["cbf11f23-ed6e-43f6-8750-fce7c6558ae4"] = Net.Definitions.Event(),
    ["ffa61bfe-d8ba-4c82-a7eb-3dd36b133184"] = Net.Definitions.AsyncFunction()
})

-- .. exports
```