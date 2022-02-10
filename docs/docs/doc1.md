---
id: introduction
title: Introduction
sidebar_label: Introduction
slug: /
---
import ThemedImage from "@theme/ThemedImage";
import useBaseUrl from '@docusaurus/useBaseUrl';

<div align="center">
    <ThemedImage
        alt="Net Logo"
        sources={{
            light: useBaseUrl("img/net2.svg"),
            dark: useBaseUrl("img/net2-light.svg")
        }}
    />
</div>
<div align="center">
	<h1>Roblox Networking (RbxNet) v2.2</h1>
    	<a href="https://www.npmjs.com/package/@rbxts/net">
	</a>
</div>

RbxNet is a _networking library_ for Roblox, built in TypeScript. It simplifies the creation and management of networking in Roblox.

## Features

- Creation and usage of remotes through "identifiers". Management of the remotes themselves are done by Net itself.
- More explicit, contextual APIs. `Net.Server` for server-based API, and `Net.Client` for client-based API.
- Ability for remote definitions through `Net.Definitions`. Remotes done through this API are auto-generated.
- Asynchronous functions - `Net.*.AsyncFunction`. No more pitfalls of regular remote functions.
- Asynchronous callbacks and methods: because it's a roblox-ts library, it supports promises.
- Middleware - Ability to add your own custom behaviours to remotes. Net comes with a runtime type checker, and a rate limiter middleware.
- `Net.*.GameMessagingEvent` - interact with `MessagingService` like you would with regular remote events. Cross-server communication with the simple API. All the limitations are handled by Net.
