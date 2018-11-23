RBX-NET
========
TypeScript version of [ModRemote](https://github.com/Vorlias/ROBLOX-ModRemote) for roblox-ts.

Requirements
=============
This requires [roblox-ts](https://github.com/roblox-ts/roblox-ts) as it is a roblox-ts module.

Installation
=============
It's as simple as
`npm i rbx-net`.

Then you can easily import it using
```ts
import Net from 'rbx-net';
```

RemoteEvents
============


Creation
---------
To create a RemoteEvent, it must be done server-side or else an error will be thrown.

```typescript
import Net from 'rbx-net';

// first way of doing it
let exampleOne = Net.createEvent("NameOfEvent");

// second way of doing it
let exampleTwo = new Net.ServerEvent("NameOfEvent");
```

Getting
------------
```ts
import Net from 'rbx-net';

// get on server
let exampleServerOne = Net.getServerEvent("NameOfEvent");
let exampleServerTwo = new Net.ServerEvent("NameOfEvent"); // THIS WILL CREATE IF NOT EXISTING!!
let exampleServerThree = Net.getServerEventAsync("NameOfEvent").then(event => {
    // do things with the event...
}, err => {
    // handle errors
});

// get on client
let exampleClientOne = Net.getClientEvent("NameOfEvent");
let exampleClientTwo = new Net.ClientEvent("NameOfEvent");
let exampleClientThree = Net.getClientEventAsync("NameOfEvent").then(event => {
    // do things with the event...
}, err => {
    // handle errors
});
```


Calling
--------

### server-side
```ts
import Net from 'rbx-net';
let nameOfEvent = Net.getEvent("NameOfEvent");
nameOfEvent.sendToAllPlayers("Hello, World!"); // will send "Hello, World!" to all players
nameOfEvent.sendToPlayers([...players], "Hello, World!"); // will send "Hello, World!" to the targeted list of players
nameOfEvent.sendToPlayer(player, "Hello, World!"); // will send "Hello, World!" to the targeted player
```


### client-side
```ts
import Net from 'rbx-net';
let nameOfEvent = Net.getEvent("NameOfEvent");
nameOfEvent.sendToServer("Hello, Server!"); // will send "Hello, Server!" to the server.
```

Recieving
---------
```ts
import Net from 'rbx-net';
let nameOfEvent = Net.getEvent("NameOfEvent");

// Using .Connect
nameOfEvent.connect((...args: any[]) => void {

});

// Using Event
nameOfEvent.event.Connect((...args: any[]) => void {

})
```



RemoteFunctions
===============


Creation
--------
To create a RemoteFunction, it must be done server-side or else an error will be thrown.

```typescript
import Net from 'rbx-net';

// first way of doing it
let exampleOne = Net.createFunction("NameOfFunction");

// second way of doing it
let exampleTwo = new Net.ServerFunction("NameOfFunction");
```


Getting
------------


### client-side
```ts
import Net from 'rbx-net';
let getFunctionOne = Net.getClientFunction("NameOfFunction");
let getFunctionTwo = Net.getClientFunctionAsync("NameOfFunction").then(func => {
    // do stuff with func
}, err => {
    // handle errors
});
let getFunctionThree = new Net.ClientFunction("NameOfFunction");
```

### server-side
```ts
import Net from 'rbx-net';
let getFunctionOne = Net.getServerFunction("NameOfFunction");
let getFunctionTwo = Net.getServerFunctionAsync("NameOfFunction").then(func => {
    // do stuff with func
}, err => {
    // handle errors
});
let getFunctionThree = new Net.ServerFunction("NameOfFunction");
```


## Calling
### server-side
Do not use server-side requests for data-sensitive things like getting inventory information etc. **Clients should not be trusted!**

Due to the nature of how unsafe it is to call a client from the server (due to the possibility of them disconnecting), the only method available is a async Promise method.

```ts
import Net from 'rbx-net';
let nameOfFunction = Net.getServerFunction("NameOfFunction");


let result = nameOfFunction.callPlayerAsync(player, "Hello, World!").then( (...response : any[]) => void {
    print(...reponse); // will print what the client sends back to the server. :-)
}, err => {
    // handle any errors from not being able to recieve messages from the client. :-)
})
```


### client-side
```ts
import Net from 'rbx-net';
let nameOfFunction = Net.getClientFunction("NameOfFunction");

// Will yield until the result is retrieved (note, this can also break your script!)
let result = nameOfFunction.callServer("Hello, World!"); 
print(result);

// Will run asynchronously and handle errors. This is recommended to be used as your server-side code could throw errors!
nameOfFunction.callServerAsync("Hello, World!").then((...result: any[]) => void {
    print(...result);
}, err => {
    // handle errors here. :-)
})
```


Recieving
--------------

```ts
import Net from 'rbx-net';
let nameOfFunction = Net.getServerFunction("NameOfFunction");
nameOfFunction.callback = (...args: any[])=> void {
    return "Hello, World!";
};
```

Caching
-------------
You can also set a cache timer on the RemoteFunction so a client will cache the result for a set amount of time.
```ts
import Net from 'rbx-net';
let nameOfFunction = Net.getServerFunction("NameOfFunction");
nameOfFunction.clientCache = 10; // will set a cache timer of 10 seconds.

// NOTE: ClientCache cannot be written on the client.
```