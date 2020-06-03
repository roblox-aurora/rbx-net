# Type Safety

It's important when you recieve events or calls from the server that you ensure the types are correct, otherwise unwanted errors may pop up.

By default, events and callbacks are typed to `unknown[]`. This may become a bit problematic when you're trying to set specific parameter types as such:

```TypeScript tab=

const addItemToPlayer = new Net.ServerEvent("AddItemToPlayer");
addItemToPlayer.Connect((player: Player, itemId: string, amount: number) => {
	// itemId and amount will show with an error
	// since unknown cannot be converted to number
}) 
```

```Lua tab=
local addItemToPlayer = Net.ServerEvent.new("AddItemToPlayer")
addItemToPlayer:Connect(function(player, itemId, amount) 
	-- itemId and amount could be anything here in Lua
	-- This can lead to bugs, especially with exploiters
end)
```

## How to enforce types
The constructors for `Net.ServerEvent`, `Net.ServerFunction` and `Net.ServerAsyncFunction` all take extra parameters that are referred to as "Type Guards".

A type guard is a basic function which takes in a value, and returns whether or not the value matches a certain criteria to be of that type.

```TypeScript tab=
function isString(value: unknown): value is string {
	return typeIs(value, "string");
}

function isNumber(value: unknown): value is number {
	return typeIs(value, "number");
}
```

```Lua tab=
function isString(value)
	return type(value) == "string"
end

function isNumber(value)
	return type(value) == "number"
end
```

So in our above case, if we wanted to enforce our RemoteEvent to only take in a string, and a number:

```TypeScript tab=
import Net from "@rbxts/net";

const addItemToPlayer = new Net.ServerEvent("AddItemToPlayer", isString, isNumber);
// Take note of 'isString' and 'isNumber' use in the constructor here.
// Also the types can be omitted as TypeScript knows what the types are now.
addItemToPlayer.Connect((player, itemId, amount) => {
	// itemId will always be a string
	// amount will always be a number
	// If either are wrong, it will get discarded
}) 
```

```Lua tab=
local Net = require(path_to_net)

local addItemToPlayer = Net.ServerEvent.new("AddItemToPlayer", isString, isNumber)
-- Take note of 'isString' and 'isNumber' use in the constructor here.
addItemToPlayer:Connect(function(player, itemId, amount) 
	-- itemId will always be a string
	-- amount will always be a number
	-- If either are wrong, it will get discarded
end)
```

## Using an existing type guard library
Writing your own functions for type guards, while doable can get tedious. There is already a library called 't' which is a good solution for this.

### TypeScript
You can [install it](https://www.npmjs.com/package/@rbxts/t) using:
```
npm i @rbxts/t
```

Then with our above example, simply replace `isString` and `isNUmber` with `t.string` and `t.number`. There are also other type guards in that library that you could use for different argument types.

```TypeScript
import t from "@rbxts/t";
import Net from "@rbxts/net";

const addItemToPlayer = new Net.ServerEvent("AddItemToPlayer", t.string, t.number);
addItemToPlayer.Connect((player, itemId, amount) => {
	// itemId will always be a string
	// amount will always be a number
	// If either are wrong, it will get discarded
}) 
```

### Lua
If you want the Lua version of t, it is available [here](https://github.com/osyrisrblx/t).

```Lua
local Net = require(path_to_net)
local t = require(path_to_t)

local addItemToPlayer = Net.ServerEvent.new("AddItemToPlayer", t.string, t.number)
addItemToPlayer:Connect(function(player, itemId, amount) 
	-- itemId will always be a string
	-- amount will always be a number
	-- If either are wrong, it will get discarded
end)
```