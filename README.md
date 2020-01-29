<div align="center">
	<img src="https://assets.vorlias.com/i1/net-tsx.png"/>
</div>
<div align="center">
	<h1>Roblox Networking Library</h1>
    	<a href="https://www.npmjs.com/package/@rbxts/net">
		<img src="https://badge.fury.io/js/%40rbxts%2Fnet.svg"></img>
	</a>
</div>

Requirements
=============
Typescript/NPM
-----------
### [Roblox Typescript Compiler](https://github.com/roblox-ts/roblox-ts) >= `0.3.0` (roblox-ts@latest)

Usage
=============
Typescript via NPM (roblox-ts@latest)
-------------

Run the command
`npm i @rbxts/net`

Usage
----------

Then you can easily import it using
```ts
import Net from "@rbxts/net";
```

Rojo (Submodule or Manual)
-------------
Unfortunately, there are only two options here. Using it as a git submodule (ick!) or copying the lualib folder to your project.
Either way, until rotriever is a thing; those are your two options.

### Submodule
`git submodule add https://github.com/roblox-aurora/rbx-net.git <targetfolder> -b lualib`
e.g. if you wanted it in modules/net: `git submodule add https://github.com/roblox-aurora/rbx-net.git modules/net -b lualib`

Then in your `*.project.json` folder, simply point it to `<targetfolder>` for the Lua output (e.g. in the above example, `modules/net`.

Roblox Model
-------------
You can find the `.rbxmx` file in releases.

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

Usage
============
Usage can be found at [README_Documentation](https://github.com/roblox-aurora/rbx-net/wiki/README_Documentation)
