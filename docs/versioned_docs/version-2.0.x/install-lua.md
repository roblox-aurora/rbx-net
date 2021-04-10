---
id: install-luau
title: Install for Luau
---
Depending on your stack for Roblox, you might want to either use the [Rojo](#via-rojo) step or the [Studio](#via-studio) step. If you don't know what _Rojo_ is, use the Studio step.

## Via Rojo
The following steps require knowledge and use of [rojo](https://rojo.space). If you're not using rojo, look at [studio](#via-studio) instructions.

:::danger
Due to this being an older version, it is no longer available for Luau. Until Rotriever is released, there is no sane way of achieving this. :(
:::


<!-- ### Using Kayak
Ensure you have  [installed](https://emozley.uk/kayak/guide/installation/) kayak and followed the [packages](https://emozley.uk/kayak/guide/packages/) guide for setting up your project's `rotriever.toml` if you haven't already.


In your `rotriever.toml` file for your project, put under `packages`:
```toml
# ...
[packages]
# ... 
Net = { git = "github.com/roblox-aurora/rbx-net", rev = "luau" }
```

Then run 
```
kayak pull
```

Then you should be able to use it via the `packages` directory. Your `packages` directory should be included in your rojo project. More information on that can be seen [here](https://emozley.uk/kayak/guide/dependencies/).

### Using PowerShell

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

### Using Git submodules
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
``` -->

## Via Studio
### RBXMX model file
Releases can be found [here](https://github.com/roblox-aurora/rbx-net/releases). Download the appropriate `.rbxmx` file under the `Assets` dropdown, then drag it into studio. Ensure the library is under `ReplicatedStorage` so it can be used by all your code.