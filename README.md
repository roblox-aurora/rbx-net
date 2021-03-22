![](logo.png) RbxNet v2.1
===========
Advanced multi-language networking library for Roblox.
-----


RbxNet is a _networking library_ for Roblox, built in TypeScript. It simplifies the creation and management of networking in Roblox.

## Features

- Creation and usage of remotes through "identifiers". Management of the remotes themselves are done by Net itself.
- More explicit, contextual APIs. `Net.Server` for server-based API, and `Net.Client` for client-based API.
- Ability for remote definitions through `Net.Definitions`.
- Asynchronous functions - `Net.*.AsyncFunction`. No more pitfalls of regular remote functions.
- Asynchronous callbacks and methods: because it's a roblox-ts library, it supports promises.
- Middleware - Ability to add your own custom behaviours to remotes. Net comes with a runtime type checker, and a rate limiter middleware.
- `Net.*.GameMessagingEvent` - interact with `MessagingService` like you would with regular remote events. Cross-server communication with the simple API. All the limitations are handled by Net.

# Documentation:

[Available Here](https://docs.vorlias.com/rbx-net/)

# Version 2.0
## Changes from 1.x
See [MIGRATION](MIGRATION.md)


