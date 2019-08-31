## Constructor
```ts
new (name: string, ...typeCheckers: TypeChecks) => NetServerFunction;
```

!!! info "name"
	The name of the NetServerEvent

???- info "typeCheckers"
	These are type checks to narrow down the types for the callback. You can use libraries like [t](https://github.com/osyrisrblx/t) for this.

	Example usage:

	```TypeScript tab=
	import t from "@rbxts/t";

	const myFunction = new Net.ServerFunction("MyFunction", t.string, t.number);
	```

	```Lua tab=
	local t = require(ReplicatedStorage.t)

	local myFunction = Net.ServerFunction.new("MyFunction", t.string, t.number)
	```

	The first parameter of the callback function in the example is _guaranteed_ to be a string, the second is _guaranteed_ to be a number.

	You can add even more type checks as parameters to the constructor, as many as required.

## Methods

### SetCallback
### SetClientCache
### GetClientCache
