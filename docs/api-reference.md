## Functions
### Net.CreateFunction {: .tag .server }

```ts
function Net.CreateFunction(name: string): NetServerFunction
```
Creates a new NetServerFunction with the specified `name`.

### Net.CreateEvent {: .tag .server }

```ts
function Net.CreateEvent(name: string): NetServerEvent
```
Creates a new NetServerEvent with the specified `name`.


### Net.Serialize
Added in 1.0.13
{: .added}

```ts
function Net.Serialize<T>(object: T): Serializable<T>;
```
Serializes the object.

???- info "Serialization Priority"
	If there's a `serialize` method in the object, that will be called
	otherwise it will iterate through the properties of the object.

	The output will be a regular table, that can be used with the networking objects.


### Net.Deserialize
Added in 1.0.13
{: .added}

```ts
function Deserialize<T>(object: Serializable<T>, 
			deserializer: (value: Serializable<T>) => T): T;
```
Deserializes the given serialized object using the specified deserializer

???- info "Deserializer"
	If the deserializer is a function, it will call it with the first argument being the serialized object.

	If the deserializer is a class with a static `deserialize` method, that will be called

	Otherwise if it is a table, it will set the properties

### Net.IsSerializable
Added in 1.0.13
{: .added}

```ts
function IsSerializable(value: unknown): boolean;
```
Checks that the object is serializable

???- info "False conditions"
	This function will return false if:
	
	- The value is not a primitive (number, boolean, string)
	- The value is a table with a metatable
	- The table has mixed values (keys and indexes)

### Net.SetConfiguration
### Net.SetClientConfiguration
### Net.GetConfiguration

## Classes

### [NetServerEvent]() {: .tag .server }
The server version of an event.

```ts
class NetServerEvent {
	constructor(name: string);
}
```

Creation:

```TypeScript tab=
// OOP
const event = new Net.ServerEvent("NameHere");

// Using
const event = Net.CreateEvent("NameHere");
```

```Lua tab=
-- OOP
local event = Net.ServerEvent.new("NameHere")

-- Using CreateEvent
local event = Net.CreateEvent("NameHere")
```

### [NetServerFunction]() {: .tag .server }
The server version of a function.

### [NetServerAsyncFunction]() {: .tag .server }
Added in 1.2.0
{: .added}

### [NetGlobalServerEvent]() {: .tag .server }
Added in 1.0.13
{: .added}

### [NetServerThrottledEvent]() {: .tag .server }

### [NetServerThrottledFunction]() {: .tag .server }

### [NetGlobalEvent]() {: .tag .server }
Added in 1.0.13
{: .added}


### [NetClientEvent]() {: .tag .client }
The client version of an event.

```ts
class NetClientEvent {
	constructor(name: string);
}
```

Creation:

```TypeScript tab=
// OOP
const event = new Net.ClientEvent("NameHere");

// Async
const event = Net.WaitForClientEventAsync("NameHere").then(event => {
	// do stuff with 'event'
});
```

```Lua tab=
-- OOP
local event = Net.ClientEvent.new("NameHere")

-- Async
local event = Net.WaitForClientEventAsync("NameHere"):andThen(function(event)
	-- do stuff with 'event'
end)
```

### [NetClientFunction]() {: .tag .client }
The client version of a function.

### [NetClientAsyncFunction]() {: .tag .client }
Added in 1.2.0
{: .added}