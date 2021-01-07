---
id: caching
title: Caching
sidebar_label: Caching
slug: /caching
---
import Code from '@site/src/components/Code'

Functions in RbxNet can be set to cache the return value. This means any subsequent requests to the function will return a local value rather than continually request the value from the server.

## Basic Usage

<Code>

```ts 
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
</Code>

With the above, when it's called it will only return a fresh tick count from the server every 10 seconds.