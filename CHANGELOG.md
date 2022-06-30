## 3.0.3
- Fixes a bug where returning `undefined`/`nil` would not return on async functions (https://github.com/roblox-aurora/rbx-net/commit/e125d70bea067609a43a8d48ec2b8169003d48fd)
## 3.0.2
- Fixes namespaced remotes not being generated correctly at runtime (https://github.com/roblox-aurora/rbx-net/issues/67)
## 3.0.1
- Fixed a bug with the Luau version of Net where it would sync incorrectly and crash Rojo.
# 3.0.0
- Added `ExperienceBroadcastEvent` - For broadcasting events between servers in your experience. This can be used for global things like cross-server chats, server browsers and announcements.
- [BREAKING] The second argument of `Definitions.Create` is now a configuration object, rather than the global middleware. Global middleware can be set by the `ServerGlobalMiddleware` property of the configuration.
- [BREAKING] The old API in `Net.Server` and `Net.Client` was removed - only the classes remain now. _It is recommended you use the definitions API as direct class access is considered unsafe_.
- Server definitions now use `Get` as well,  `Create` is deprecated.
- Remotes are automatically created on the server (This is configurable in the definitions configuration)
- `Get` calls on the client yield for the remote (This is also configurable in the definitions configuration, if you want the old behaviour)
- Improved connection behaviour with server events.
