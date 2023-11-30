---
id: ratelimit
title: Rate limiting your remotes
sidebar_label: Rate limiting
slug: /middleware/rate-limit
---
import Code, { DEFAULT_VALUE, GROUP, TABS } from '@site/src/components/Code'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Your event or AsyncFunction may perform an intensive task that you don't want players to be able to invoke every second (and possibly crash your game)

A way you can get around this is by using the [`Net.Middleware.RateLimit`](../api/middleware#ratelimit) middleware. This is a built in.

## Limiting to a certain amount of requests

The rate limiter middleware is created as such:

<Tabs defaultValue={DEFAULT_VALUE} groupId={GROUP} values={TABS}>
 <TabItem value="ts">

```ts
Net.Middleware.RateLimit({
    MaxRequestsPerMinute: 1 // This can be the amount of requests you want to limit per minute
})
```
 </TabItem>
 <TabItem value="luau">

```lua
Net.Middleware.RateLimit({
    MaxRequestsPerMinute = 1 -- This can be the amount of requests you want to limit per minute
})
```
 </TabItem>
</Tabs>

Then you pass it to a constructor for a server object, or a definition:

<Tabs defaultValue={DEFAULT_VALUE} groupId={GROUP} values={TABS}>
 <TabItem value="ts">

```ts
const Remotes = Net.Definitions.Create({
    Example: Net.Definitions.AsyncFunction([
        Net.Middleware.RateLimit({
            MaxRequestsPerMinute: 1
        })
    ])
})
```

 </TabItem>
 <TabItem value="luau">

```lua
local Remotes = Net.Definitions.Create({
    Example = Net.Definitions.AsyncFunction({
        Net.Middleware.RateLimit({
            MaxRequestsPerMinute = 1
        })
    })
})
```

 </TabItem>
</Tabs>


## Custom Error Handling
When the rate limit is reached, it will run the error handler. By default this is set to a function which displays a warning on the server:

```ts
export function rateLimitWarningHandler(error: RateLimitError) {
	warn("[rbx-net]", error.Message);
}
```

However, if you want to send this to something like analytics, you can provide your own error handler:

<Tabs defaultValue={DEFAULT_VALUE} groupId={GROUP} values={TABS}>
 <TabItem value="ts">

```ts
function analyticRateLimitError(error: RateLimitError) {
    AnalyticsService.Error(error.Message); // this is just an example
}
```

```ts
const Remotes = Net.Definitions.Create({
    Example: Net.Definitions.AsyncFunction([
        Net.Middleware.RateLimit({
            MaxRequestsPerMinute: 1,
            ErrorHandler: analyticRateLimitError
        })
    ])
})
```

 </TabItem>
 <TabItem value="luau">

```lua
local function analyticRateLimitError(error)
    AnalyticsService:Error(error.Message) -- this is just an example
end
```

```lua
local Remotes = Net.Definitions.Create({
    Example = Net.Definitions.AsyncFunction({
        Net.Middleware.RateLimit({
            MaxRequestsPerMinute = 1,
            ErrorHandler = analyticRateLimitError
        })
    })
})
```

 </TabItem>
</Tabs>
