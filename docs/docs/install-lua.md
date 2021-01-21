---
id: install-luau
title: Install for Luau
---

<!-- ## Via [Kayak](https://emozley.uk/kayak/guide/installation/)
:::danger
There are bugs with Kayak that prevent this step working at the moment.
:::
Ensure you have followed [Packages](https://emozley.uk/kayak/guide/packages/) guide for setting up your project's `rotriever.toml`.


In your `rotriever.toml` file for your project, put under `packages`:
```toml
# ...
[packages]
# ... 
Net = { git = "github.com/roblox-aurora/rbx-net", rev = "luau" }
```

Then you should be able to use it via `packages/Net`. Your `packages` directory should be included in your rojo project. More information on that can be seen [here](https://emozley.uk/kayak/guide/dependencies/). -->

## Via PowerShell

Enter into powershell: 
```powershell
Invoke-WebRequest -UseBasicParsing vorlias.com/rbx-net.ps1 | Invoke-Expression
```
Source of the script is available [here](https://vorlias.com/rbx-net.ps1)

:::caution
Note: if you get an error you might need to change the execution policy (i.e. enable Powershell) with
```powershell
Set-ExecutionPolicy RemoteSigned -scope CurrentUser
```
:::

This will install the Luau version of Net under a packages/Net folder in your project.

Then you can include it in your `*.project.json` file like so:
```json
// ...
    "ReplicatedStorage": {
        // ...
        "Net": {
            "$path": "packages/Net"
        }
        // ...
    },
// ...
```

And now you can use rbx-net like so:
```lua
local Net = require(game:GetService("ReplicatedStorage").Net)
```

## Via Git submodules
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
            "$path": "submodules/Net"
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