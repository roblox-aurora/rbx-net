<div align="center">
	<img src="https://assets.vorlias.com/i1/net-tsx.png"/>
</div>
<div align="center">
	<h1>Roblox Networking Library (Typescript)</h1>
    	<a href="https://www.npmjs.com/package/rbx-net">
		<img src="https://badge.fury.io/js/rbx-net.svg"></img>
	</a>
</div>

TypeScript version of [ModRemote](https://github.com/Vorlias/ROBLOX-ModRemote) for roblox-ts.

Requirements
=============
This requires [roblox-ts](https://github.com/roblox-ts/roblox-ts) as it is a roblox-ts module. Future Lua support will be added once `roblox-ts` has a bundling feature.

Installation
=============
It's as simple as
`npm i rbx-net`.

Then you can easily import it using
```ts
import Net from 'rbx-net';
```

Why use RBX-NET?
============
## Ease of Use
- All you need to do to use a RBX-NET remote is a name. RBX-NET handles all the instance-related magic for you. Gone are the days where you quietly die inside by using a single remote because you don't want to have to manage 100's of different remotes.

## Asynchronous Methods
- The ability to wait until remotes are created before using them
- Calls with RemoteFunctions can run and return a result without yielding your code.

## Global Messaging ++
- Using `GlobalServerEvent`, you can fire global events to specific players or groups of players within other servers. `GlobalEvent` is the MessagingService equivalent for rbx-net.
- You can also target specific JobIds (servers)
- rbx-net handles the rate limits for MessagingService itself, and will queue any requests that go over the limit and send them when the limit expires.

## Caching
- Remote Function values can be cached, meaning that any subsequent requests will not perform unnecessary requests.

## Throttling
- Limit the amount of requests in a span of time (default 60 seconds) that your server code allows via throttling.

Usage
============
Usage can be found at [README_Documentation](https://github.com/roblox-aurora/rbx-net/wiki/README_Documentation)
