`NetClientAsyncFunction` is a class that functions similarly to a `NetServerFunction`, however unlike a `NetClientFunction` it uses events rather than functions behind the scenes.

The advantage to this is it allows for timeouts.

`NetClientAsyncFunction` also supports returning promises in the callback function.

## Constructor
```ts
new (name: string) => NetClientAsyncFunction;
```

!!! info "name"
	The name of the NetClientAsyncFunction

## Methods

### CallPlayerAsync
```ts
CallServerAsync(...args: Array<unknown>): Promise<unknown>;
```
Calls the server and returns a promise that will either resolve with the returned value from the server, or reject if the timeout is reached.

Example usage

```TypeScript tab=
const myAsyncFunction = new Net.ClientAsyncFunction("MyAsyncFunction");
myAsyncFunction.CallServerAsync("SayHello").then(result => {
	print("The server said", result);
}).catch((err: string) => {
	print("Failed to get message from server. :(", err);
})
```

```Lua tab=
local myAsyncFunction = Net.ClientAsyncFunction.new("MyAsyncFunction")
myAsyncFunction:CallServerAsync("SayHello"):andThen(
	function(result)
		print("The server said", result)
	end
):catch(function(err)
	print("Failed to get message from server. :(", err)
end)
```


### SetCallback
```ts
SetCallback(callback: Callback): void;
```
Sets the callback for this function

Example

```TypeScript tab=
const myAsyncFunction = new Net.ClientAsyncFunction("MyAsyncFunction");
myAsyncFunction.SetCallback((message: string) => {
	return "You sent me" + message;
});
```

```Lua tab=
local myAsyncFunction = Net.ClientAsyncFunction.new("MyAsyncFunction")
myAsyncFunction:SetCallback(function(message) 
	return "You sent me" .. message
end)
```

### SetCallTimeout
```ts
SetCallTimeout(seconds: number): void;
```

### SetCallTimeout
```ts
GetCallTimeout(): number;
```