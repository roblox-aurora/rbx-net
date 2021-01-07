---
id: introduction
title: Introduction
sidebar_label: Introduction
slug: /
---

:::info
The documentation for 1.3.x is still being ported over to docosaurus.
:::

<div align="center">
	<img src="https://assets.vorlias.com/i1/net-tsx.png"/>
</div>
<div align="center">
	<h1>Roblox Networking Library v1.3</h1>
    	<a href="https://www.npmjs.com/package/@rbxts/net">
	</a>
</div>

RbxNet is a _networking library_ for Roblox, built in TypeScript. It simplifies the creation and management of networking in Roblox.

:::info "Info"
While RbxNet is primarily a Roblox TypeScript library, it also is available for Lua. 
:::

## Features
- Creation & Usage of remotes through "IDs". The actual remotes are managed by Net.
- More explicit, contextual APIs. `Server` objects are explicitly for the server, `Client` objects explicitly for the client.
- Asynchronous remote functions (`Net*AsyncFunction`) - Which unlike regular remote functions allow timeouts and safely calling clients without issues.
- Asynchronous methods - part of being a roblox-ts built library is the support for `Promise`.
- Caching - Results from RemoteFunctions can be cached on the client for a set amount of time.
- Throttling - RemoteFunctions and RemoteEvents can be set to throttle requests.
- [Type Safety](/docs/1.3.x/type-safety/) - Using a library such as `t`, you can explicitly set what your RemoteFunctions/RemoteEvents accept as valid arguments. Any invalid arguments will be discarded.
- GlobalServerEvents - Special RemoteEvent-like objects that use MessagingService to communicate cross-server. Limitations of MessagingService are automatically handled through it.
- Serialization Helpers - Net.Serialize, Net.Deserialize, Net.IsSerializable