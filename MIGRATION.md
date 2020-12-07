![](logo.png)  Version 2.0
=====

## Differences from 1.x
### Server
- Events and functions now have _middleware_. Runtime type checking is now done via the `TypeChecker` middleware.
- `Net.ServerEvent` is now `Net.Server.Event`
- `Net.ServerFunction` is now gone, in favour of `Net.Server.AsyncFunction`
- `Net.ServerAsyncFunction` is now `Net.Server.AsyncFunction`
- `Net.GlobalServerEvent` is now `Net.Server.CrossServerEvent`
- `Net.ServerThrottledEvent` is now gone - use the `RateLimit` middleware.
- `Net.ServerThrottledFunction` is now gone - use the `RateLimit` middleware.
### Client
- `Net.ClientEvent` is now `Net.Client.Event`
- `Net.ClientFunction` is gone, in favour of `Net.Client.AsyncFunction`
- `Net.ClientAsyncFunction` is now `Net.Client.AsyncFunction`
- `Net.GlobalClientEvent` is now `Net.Client.CrossServerEvent`