---
id: install-luau
title: Install for Luau
---
Depending on your stack for Roblox, you might want to either use the [Rojo](#via-rojo) step or the [Studio](#via-studio) step. If you don't know what _Rojo_ is, use the Studio step.

## Via Rojo
The following steps require knowledge and use of [rojo](https://rojo.space). If you're not using rojo, look at [studio](#via-studio) instructions.

### Install via Wally
First, if you haven't already - [Install Wally](https://github.com/UpliftGames/wally).

Then, in your `wally.toml` file for your project, put under `dependencies`:
```toml
# ...
[dependencies]
# ...
Net = "vorlias/net@2.1.4"
```

Then run 
```
wally install
```

### Manually install via git submodules
:::caution
This method, while works... isn't the nicest way to do it.
:::

Execute in powershell or bash:
```powershell
git submodule add https://github.com/roblox-aurora/rbx-net -b luau submodules/Net
```

Then you can include it in your `*.project.json` file like so:
```json
// ...
    "ReplicatedStorage": {
        // ...
        "Net": {
            "$path": "submodules/Net/dist"
        }
        // ...
    },
// ...
```

And now you can use rbx-net like so:
```lua
local Net = require(game:GetService("ReplicatedStorage").Net)
```

<!-- 
## From GitHub
This is the option to use if you're wanting to use the latest master build of rbx-net. It's recommended though you use the above NPM option.

```bash
npm install github:roblox-aurora/rbx-net
```
Once you have the module installed, you can then use it in code by importing it as such:
```ts
import Net from "@rbxts/net";
``` -->

## Via Studio
### RBXMX model file
Releases can be found [here](https://github.com/roblox-aurora/rbx-net/releases). Download the appropriate `.rbxmx` file under the `Assets` dropdown, then drag it into studio. Ensure the library is under `ReplicatedStorage` so it can be used by all your code.