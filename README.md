<img src="logo.png" align="right"/>

<h1>RbxNet v3.0</h1>
<h3>Advanced multi-language networking library for Roblox.</h3>

<a href="https://www.npmjs.com/package/@rbxts/net"><img src="https://badge.fury.io/js/@rbxts%2Fnet.svg" alt="npm version" height="18"></a>
<a href="https://wally.run/package/vorlias/net"><img src="https://img.shields.io/badge/wally%20package-2.1.4-red" height="18"/></a>


RbxNet is a _networking library_ for Roblox, built in TypeScript. It simplifies the creation and management of networking in Roblox.

## Features

- Creation and usage of remotes through "identifiers". Management of the remotes themselves are done by Net itself.
- Ability for remote definitions through `Net.Definitions`.
- Asynchronous functions - `AsyncFunction`. No more pitfalls of regular remote functions.
- Asynchronous callbacks and methods: because it's a roblox-ts library, it supports promises.
- Server to server events (Via MessagingService)
- Middleware - Ability to add your own custom behaviours to remotes. Net comes with a runtime type checker, and a rate limiter middleware.
<!-- - `Net.*.GameMessagingEvent` - interact with `MessagingService` like you would with regular remote events. Cross-server communication with the simple API. All the limitations are handled by Net. -->

# Documentation:

[Available Here](https://rbxnet.australis.dev/)
