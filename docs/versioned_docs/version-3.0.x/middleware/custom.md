---
id: custom
title: Writing custom middleware
sidebar_label: Write your own
slug: /middleware/custom
---
import Code, { DEFAULT_VALUE, GROUP, TABS } from '@site/src/components/Code'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

If you want to write a custom middleware (e.g. for logging, or other purposes), you must write a `Net.Middleware` compatible function. This is similar to a middleware function in [_rodux_](https://roblox.github.io/rodux/advanced/middleware/).

This function is given a callback `nextEvent`, and `instance` (the remote instance).

It expects you to return a function, which is given the `sender`, and the `args` (arguments) after that, that were passed.
This inner function should call and return `nextEvent` (if you want it to succeed) - or return nothing (if you don't want your remote to succeed with calling)


<Tabs defaultValue={DEFAULT_VALUE} groupId={GROUP} values={TABS}>
  <TabItem value="ts">

```ts title="Middleware Type Signature"
type NetMiddleware<CallArguments, PreviousCallArguments> = 
    (next: (player: Player, ...args: CallArguments) => void, event: NetManagedInstance) 
        => (sender: Player, ...args: PreviousCallArguments) => void;
```

```ts
export const MyMiddleware: Net.Middleware = (nextMiddleware, instance) => {
	return (sender, ...args) => {
		return nextMiddleware(sender, ...args);
	};
};
```

  </TabItem>
  <TabItem value="luau">

```lua title="Luau Type"
type NetMiddleware<CallArguments, PreviousCallArguments> = 
	(next: (player: Player, ...CallArguments) -> any, instance: NetManagedInstance)
	    -> (player: Player, ...PreviousCallArguments) -> any
```

```lua
function MyMiddleware(next, instance)
	return function(player, ...)
		return next(player, ...)
	end
end

return {
    MyMiddleware = MyMiddleware
}
```

  </TabItem>
</Tabs>

For example, if we want a specific remote to only be callable by _administrators_ in our game:-


<Tabs defaultValue={DEFAULT_VALUE} groupId={GROUP} values={TABS}>
  <TabItem value="ts">

```ts
const GROUP_ID = 2664663; //  Group id would go here
export const AdministratorMiddleware: Net.Middleware = (nextMiddleware, instance) => {
	return (sender, ...args) => {
        if (sender.GetRankInGroup(GROUP_ID) >= 250) {
            // This would continue the remote execution
            return nextMiddleware(sender, ...args);
        }

        // Otherwise the remote request is ignored
	};
};
```

  </TabItem>
  <TabItem value="luau">

```lua
local GROUP_ID = 2664663 -- group id would go here

function MyMiddleware(next, instance)
	return function(sender, ...)
        if sender:GetRankInGroup(GROUP_ID) >= 250 then
            -- This would continue the remote execution
            return next(sender, ...)
        end

		-- Otherwise the remote request is ignored since the next middleware is never called
	end
end

return {
    MyMiddleware = MyMiddleware
}
```

  </TabItem>
</Tabs>

The above middleware, when applied to a remote will only continue and call the callback/listener _if_ the `next`/`nextMiddleware` callbacks are called. Otherwise RbxNet will drop these requests.