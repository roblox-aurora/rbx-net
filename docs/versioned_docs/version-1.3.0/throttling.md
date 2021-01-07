---
id: throttling
title: Throttling
sidebar_label: Throttling
slug: /throttling
---
import Code from '@site/src/components/Code'

When using remotes in Roblox, you might want to limit the amount of times a user can send a request to a remote event or remote function.

## Basic Usage

Say for example we have a remote object that fetches a list of items. Ideally we wouldn't want the user to be able to continuously spam it.

<!-- === "Tab 1"
    Markdown **content**.

    Multiple paragraphs.

=== "Tab 2"
	What -->


<Code>

```ts
const fetchItemList = new Net.ServerFunction("FetchItemList");
fetchItemList.SetRateLimit(1);
fetchItemList.SetCallback((player) => {
	// ...
	return data;
});
```

```lua
local fetchItemList = Net.ServerFunction.new("FetchItemList")
fetchItemList:SetRateLimit(1)
fetchItemList:SetCallback(function(player)
	-- ...
	return data
end)
```

</Code>

What the above does, is it creates a server function and then sets a limit of 1 request per minute.