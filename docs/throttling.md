When using remotes in Roblox, you might want to limit the amount of times a user can send a request to a remote event or remote function.


!!! info "Supported By"
	- [ServerEvent](class/NetServerEvent) `>= 1.3.0`
	- [ServerFunction](class/NetServerFunction) `>= 1.3.0`

	- {--*[ServerThrottledEvent](class/NetServerEvent)*--} <code>[deprecated](https://github.com/roblox-aurora/rbx-net/issues/20)</code>
	- {--*[ServerThrottledFunction](class/NetServerFunction)*--} <code>[deprecated](https://github.com/roblox-aurora/rbx-net/issues/20)</code>

## Basic Usage

Say for example we have a remote object that fetches a list of items. Ideally we wouldn't want the user to be able to continuously spam it.

=== "Tab 1"
    Markdown **content**.

    Multiple paragraphs.

=== "Tab 2"
	What


```ts tab="TypeScript"
const fetchItemList = new Net.ServerFunction("FetchItemList");
fetchItemList.SetRateLimit(1);
fetchItemList.SetCallback((player) => {
	// ...
	return data;
});
```

```lua tab="Lua"
local fetchItemList = Net.ServerFunction.new("FetchItemList")
fetchItemList:SetRateLimit(1)
fetchItemList:SetCallback(function(player)
	-- ...
	return data
end)
```

What the above does, is it creates a server function and then sets a limit of 1 request per minute.