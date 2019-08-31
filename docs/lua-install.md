title: Lua Install

Git Submodule
------------

!!! info
	This process requires knowledge of [rojo](https://github.com/rojo-rbx/rojo).

To use RbxNet as a git submodule, you need to do the following:

Run the command

```
git submodule add https://github.com/roblox-aurora/rbx-net.git <targetfolder> -b lualib
```
e.g. if you wanted it in modules/net: 
```
git submodule add https://github.com/roblox-aurora/rbx-net.git modules/net -b lualib
```

Then in your `*.project.json` folder, simply point it to `<targetfolder>` for the Lua output (e.g. in the above example, `modules/net`.

Roblox Model
----------
You can find the `.rbxmx` file in [releases](https://github.com/roblox-aurora/rbx-net/releases). Simply just drag the downloaded file into studio and move it to ReplicatedStorage.