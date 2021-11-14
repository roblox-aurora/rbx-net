---
id: install-luau
title: Install for Luau
---
Depending on your stack for Roblox, you might want to either use the [Rojo](#via-rojo) step or the [Studio](#via-studio) step. If you don't know what _Rojo_ is, use the Studio step.

## Via Rojo
The following steps require knowledge and use of [rojo](https://rojo.space). If you're not using rojo, look at [studio](#via-studio) instructions.

### Install via Wally _(Recommended)_
First, if you haven't already - [Install Wally](https://github.com/UpliftGames/wally).

Then, in your `wally.toml` file for your project, put under `dependencies`:
```toml
# ...
[dependencies]
# ...
Net = "vorlias/net@2.2.0"
```

Then run 
```
wally install
```

## Via Studio
### RBXMX model file
Releases can be found [here](https://github.com/roblox-aurora/rbx-net/releases). Download the appropriate `.rbxmx` file under the `Assets` dropdown, then drag it into studio. Ensure the library is under `ReplicatedStorage` so it can be used by all your code.