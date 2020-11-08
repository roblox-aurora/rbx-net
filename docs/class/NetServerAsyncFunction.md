`NetServerAsyncFunction` is a class that functions similarly to a `NetServerFunction`, however unlike a `NetServerFunction` it uses events rather than functions behind the scenes.

The advantage to this is that it supports calling the client (player) directly unlike `NetServerFunction`, as it has built in timeouts.

`NetServerAsyncFunction` also supports returning promises in the callback function.

## Constructor
```ts
new (name: string, ...typeCheckers: TypeChecks) => NetServerAsyncFunction;
```

!!! info "name"
	The name of the NetServerAsyncFunction

???- info "typeCheckers"
	These are type checks to narrow down the types for the callback. You can use libraries like [t](https://github.com/osyrisrblx/t) for this.

	Example usage:

	```TypeScript tab=
	import t from "@rbxts/t";

	const myAsyncFunction = new Net.ServerAsyncFunction("MyAsyncFunc", t.string, t.number);
	```

	```Lua tab=
	local t = require(ReplicatedStorage.t)

	local myAsyncFunction = Net.ServerAsyncFunction.new("MyAsyncFunc", t.string, t.number)
	```

	The first parameter of the callback function in the example is _guaranteed_ to be a string, the second is _guaranteed_ to be a number.

	You can add even more type checks as parameters to the constructor, as many as required.

## Methods

### CallPlayerAsync
```ts
CallPlayerAsync(player: Player, ...args: Array<unknown>): Promise<unknown>;
```
Calls the specified player and returns a promise that will either resolve with the returned value from the player, or reject if the timeout is reached.

Example usage

```TypeScript tab=
const myAsyncFunction = new Net.ServerAsyncFunction("MyAsyncFunction");
myAsyncFunction.CallPlayerAsync(game.Players.Vorlias, "SayHello").then(result => {
	print("Vorlias said", result);
}).catch((err: string) => {
	print("Failed to get message from Vorlias. :(", err);
})
```

```Lua tab=
local myAsyncFunction = Net.ServerAsyncFunction.new("MyAsyncFunction")
myAsyncFunction:CallPlayerAsync(game.Players.Vorlias, "SayHello"):andThen(
	function(result)
		print("Vorlias said", result)
	end
):catch(function(err)
	print("Failed to get message from Vorlias. :(", err)
end)
```


### SetCallback
```ts
SetCallback(callback: Callback): void;
```
Sets the callback for this function

Example

```TypeScript tab=
const myAsyncFunction = new Net.ServerAsyncFunction("MyAsyncFunction", t.string);
myAsyncFunction.SetCallback((player: Player, message: string) => {
	return "You sent me" + message;
});
```

```Lua tab=
local myAsyncFunction = Net.ServerAsyncFunction.new("MyAsyncFunction")
myAsyncFunction:SetCallback(function(player, message) 
	return "You sent me" .. message
end)
```

### SetCallTimeout
```ts
SetCallTimeout(seconds: number): void;
```

### GetCallTimeout
```ts
GetCallTimeout(): number;
```
