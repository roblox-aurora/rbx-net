<div align="center">
	<img src="https://assets.vorlias.com/i1/net-tsx.png"/>
</div>
<div align="center">
	<h1>Roblox Networking Library</h1>
    	<a href="https://www.npmjs.com/package/@rbxts/net">
	</a>
</div>

RbxNet is a _networking library_ for Roblox, built in TypeScript.

!!! info "Info"
    While RbxNet is primarily a Roblox TypeScript library, it also is available for Lua. 

Why use Net?
============
## Ease of Use
- All you need to do to use a NET remote is a name. NET handles all the instance-related magic for you. Gone are the days where you quietly die inside by using a single remote because you don't want to have to manage 100's of different remotes.

## Asynchronous Methods
- The ability to wait until remotes are created before using them
- Calls with RemoteFunctions can run and return a result without yielding your code.

## Global Messaging ++ (Beta)
- Using `GlobalServerEvent`, you can fire global events to specific players or groups of players within other servers. `GlobalEvent` is the MessagingService equivalent for net.
- You can also target specific JobIds (servers)
- net handles the rate limits for MessagingService itself, and will queue any requests that go over the limit and send them when the limit expires.

## Serialization Helpers
- Functions to help with serialization / deserialization of values.

## Caching
- Remote Function values can be cached, meaning that any subsequent requests will not perform unnecessary requests.

## Throttling
- Limit the amount of requests in a span of time (default 60 seconds) that your server code allows via throttling.



<!-- # Installation

```Lua tab= hl_lines="1 3"
require(path_to_rbxnet.Net)
```

```TS tab=
import Net from "@rbxts/net";

new Net.ServerFunction();
```


!!! hint "Iporting"
    ```
    Fences
    ``` -->