<img src="logo.png" align="right"/>

<h1>RbxNet</h1>
<h3>Advanced multi-language networking framework for Roblox.</h3>

<a href="https://www.npmjs.com/package/@rbxts/net"><img src="https://badge.fury.io/js/@rbxts%2Fnet.svg" alt="npm version" height="18"></a>
<a href="https://wally.run/package/vorlias/net"><img src="https://img.shields.io/badge/wally%20package-2.1.4-red" height="18"/></a>

---

RbxNet is a definition-based _networking framework_ for Roblox, built in TypeScript, but also available in Luau. It simplifies the creation and management of networking in Roblox experiences.

## Features
- Create a _definitions_ file of all your networking-based objects in your game. This is a single source of truth for your networking objects. No more tracking instances manually, or having to programmatically create them manually. Each network object is represented by an identifier you define, and by default is created on the server at runtime.
- Scoped namespacing - Networking objects can be _namespaced_, so you can group related networking objects for easier organization.
- Simple contextual-based API for fetching and using the networking objects.
    - `<DefinitionObject>.[Server|Client].Get` To fetch objects from your definitions as usable objects.
- Ability to add middleware to your networking objects. Type checking, rate limiting, restricting, logging, you name it.
    - RbxNet comes with `TypeChecking`, `RateLimiter` and `Logger` built-in.
- `*AsyncFunction`: Asynchronous networking remotes - Event-driven send/recieve messaging between server and client, with no pitfalls of regular `Function`s.
- Asynchronous callbacks and methods: RbxNet is a roblox-ts native library, meaning it supports promises out of the box.
- `ExperienceBroadcastEvent` (v3.0): Experience-based broadcasting through `MessagingService`. Allows for uses like cross-server chat, server browsers and announcements.

# Documentation:

[Available Here](https://rbxnet.australis.dev/)

# Extensions

## Libraries
Listed here are libraries based around, or useful to RbxNet.

| Library                                                    | Languages | Description                                                                                   |
|------------------------------------------------------------|-----------|-----------------------------------------------------------------------------------------------|
| [EncryptedNet](https://github.com/boatbomber/EncryptedNet) | Luau      | Authenticated encryption of Roblox networking with ECDH key exchanges and ChaCha20 ciphering. |

## Tools
Listed here are tools that are useful to RbxNet.

| Tools                                                                     | Type                 | Description                                                                 |
|-------------------------------------------------------------------------------|----------------------|-----------------------------------------------------------------------------|
| [rbxts-transform-guid](https://github.com/roblox-aurora/rbxts-transform-guid) | TypeScript Transformer | Generates compile-time GUIDs for Enums. Useful for compile-time remote ids. |

# More Help & Links

[Australis OSS Community](https://discord.gg/SvUcvTRjPZ)
