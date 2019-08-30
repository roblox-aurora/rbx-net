Events are useful for messages you want to send to either a player or the server, that expects no response. This could be things like the player's inventory updating, the player unlocking an achievement and so forth.

# Overview
RbxNet has two main event classes:

- ServerEvent (`NetServerEvent`)
	- This class handles events from the server
- ClientEvent (`NetClientEvent`)
	- This class handles events from the clients (players)

There are also other secondary event classes:

- `ServerThrottledEvent`, `ServerThrottledFunction` which are covered in [Throttling]()
- `GlobalEvent` and `GlobalServerEvent` which are covered in [Global Events]()

# Server Event

## Creating a ServerEvent

You can create a server event with the following

### Procedural
```TypeScript tab=
const yourEventName = Net.CreateEvent("YourEventName");
```

```Lua tab=
local yourEventName = Net.CreateEvent("YourEventName");
```

### Object-oriented
```TypeScript tab=
const yourEventName = new Net.ServerEvent("YourEventName");
```

```Lua tab=
local yourEventName = Net.ServerEvent.new("YourEventName")
```

### Asynchronously
```TypeScript tab=
Net.GetServerEventAsync("YourEventName").then(event => {
    // ... Do stuff with 'event'
});
```

```Lua tab=
Net.GetServerEventAsync("YourEventName"):andThen(function(event)
    -- ... Do stuff with 'event'
end)
```

## Hooking up the server to listen
Now that we've created a server event, we want to be able to listen out for any messages sent by the client. (player)

That can be achieved with the `Connect` method.

```TypeScript tab=
const yourEventName = Net.CreateEvent("YourEventName");
yourEventName.Connect((player: Player, ...args: Array<unknown>) => {
    // ... handle messages received here
});
```

```Lua tab=
local yourEventName = Net.CreateEvent("YourEventName")
yourEventName:Connect(function(player, ...) 
	local args = {...}
	-- handle messages recieved here
end)
```

## Sending events to the client (Player)

```TypeScript tab=
// assuming we're still using yourEventName as the Event

// This would send "Hello, World!" to the "YourEventName" remote.
yourEventName.SendToPlayer(game.Players.Player1, "Hello, World!");

// You can also send to all players
yourEventName.SendToAllPlayers("Hello, World!");

// or send to specific players
yourEventName.SendToPlayers([game.Players.Player1, game.Players.Player3], "Hello, World!");
```

```Lua tab=
-- assuming we're still using yourEventName as the Event

-- This would send "Hello, World!" to the "YourEventName" remote.
yourEventName:SendToPlayer(game.Players.Player1, "Hello, World!")

-- You can also send to all players
yourEventName:SendToAllPlayers("Hello, World!")

-- or send to specific players
yourEventName:SendToPlayers({game.Players.Player1, game.Players.Player3}, "Hello, World!")
```

# Client Event
An event must first be created on the server using `ServerEvent`, or it will error. If you don't want it to error, use the asynchronous method of getting the event.

## Getting a ClientEvent
You can create a client event with the following


### Asynchronously (Recommended)
```TypeScript tab=
const yourEventName = Net.WaitForClientEventAsync("YourEventName").then(event => {
    // ... connect to the event here, fire the event, etc.
});
```

```Lua tab=
local yourEventName = Net.WaitForClientEventAsync("YourEventName"):andThen(function(event) 
	-- Connect to the event here, fire the event, etc.
end)
```

### Object-oriented
This will error if the event does not exist on the server!

```TypeScript tab=
const yourEventName = new Net.ClientEvent("YourEventName");
```

```Lua tab=
local yourEventName = Net.ClientEvent.new("YourEventName");
```

## Hooking up the client to listen
Just like the server event, we can also connect on the client to listen to any messages sent by the server. That can be achieved with the `Connect` method.

```TypeScript tab=
Net.WaitForClientEventAsync("YourEventName").then(event => {
	event.Connect((...args: Array<unknown>) => {
		// ... do things with the recieved events.
	});
});
```

```Lua tab=
Net.WaitForClientEventAsync("YourEventName"):andThen(function(event)
	event:Connect(function(...)
		local args = {...}
		-- ... do things with the recieved events.
	end)
end)
```

## Sending events to the server

```TypeScript tab=
// assuming we're still using yourEventName as the Event

// This would send "Hello, World!" to the "YourEventName" remote, to the server.
yourEventName.SendToServer("Hello, World!");
```

```Lua tab=
-- assuming we're still using yourEventName as the Event

-- This would send "Hello, World!" to the "YourEventName" remote, to the server.
yourEventName:SendToServer("Hello, World!")
```