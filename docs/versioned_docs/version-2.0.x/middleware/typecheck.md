---
id: typecheck
title: Runtime Type Checking
sidebar_label: Enforcing types at runtime
slug: /middleware/types
---
import Code, { DEFAULT_VALUE, GROUP, TABS } from '@site/src/components/Code'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

It's important when you recieve events or calls from the server that you ensure the types are correct, otherwise unwanted errors may pop up.

If you want to ensure the types you're recieving from the client _are_ the types you're expecting, you can use the [`Net.Middleware.TypeChecking`](../api/middleware#typechecking) middleware.

This middleware just takes type checking functions.

## Using a library like `t`

The rate limiter middleware is created as such:

<Tabs defaultValue={DEFAULT_VALUE} groupId={GROUP} values={TABS}>
 <TabItem value="ts">

```ts
Net.Middleware.TypeCheck(t.string)
```
 </TabItem>
 <TabItem value="luau">

```lua
Net.Middleware.TypeCheck(t.string)
```

 </TabItem>
</Tabs>