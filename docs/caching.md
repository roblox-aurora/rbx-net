Functions in RbxNet can be set to cache the return value. This means any subsequent requests to the function will return a local value rather than continually request the value from the server.


!!! info "Supported By"
	- [ServerFunction](class/NetServerFunction)


## Basic Usage

```ts tab="TypeScript"
const exampleCachedRemote = new Net.ServerFunction("Example");
exampleCachedRemote.SetClientCache(10);
exampleCachedRemote.SetCallback((player) => {
	return tick();
})
```

```lua tab="Lua"
local exampleCachedRemote = Net.ServerFunction.new("Example")
exampleCachedRemote:SetClientCache(10)
exampleCachedRemote:SetCallback(function(player)
	return tick()
end)
```

With the above, when it's called it will only return a fresh tick count from the server every 10 seconds.