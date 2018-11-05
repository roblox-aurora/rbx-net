RBX-NET
========
TypeScript version of [ModRemote](https://github.com/Vorlias/ROBLOX-ModRemote) for roblox-ts.

RemoteEvents
============


Creation
---------
To create a RemoteEvent, it must be done server-side or else an error will be thrown.

```typescript
import Net from 'rbx-net';

// first way of doing it
let exampleOne = Net.CreateEvent("NameOfEvent");

// second way of doing it
let exampleTwo = new Net.ServerEvent("NameOfEvent");
```

Getting
------------
```ts
import Net from 'rbx-net';

// get on server
let exampleServerOne = Net.GetServerEvent("NameOfEvent");
let exampleServerTwo = new Net.ServerEvent("NameOfEvent"); // THIS WILL CREATE IF NOT EXISTING!!
let exampleServerThree = Net.GetServerEventAsync("NameOfEvent").then(event => {
    // do things with the event...
}, err => {
    // handle errors
});

// get on client
let exampleClientOne = Net.GetClientEvent("NameOfEvent");
let exampleClientTwo = new Net.ClientEvent("NameOfEvent");
let exampleClientThree = Net.GetClientEventAsync("NameOfEvent").then(event => {
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
let nameOfEvent = Net.GetEvent("NameOfEvent");
nameOfEvent.SendToAllPlayers("Hello, World!"); // will send "Hello, World!" to all players
nameOfEvent.SendToPlayers([...players], "Hello, World!"); // will send "Hello, World!" to the targeted list of players
nameOfEvent.SendToPlayer(player, "Hello, World!"); // will send "Hello, World!" to the targeted player
```


### client-side
```ts
import Net from 'rbx-net';
let nameOfEvent = Net.GetEvent("NameOfEvent");
nameOfEvent.SendToServer("Hello, Server!"); // will send "Hello, Server!" to the server.
```

Recieving
---------
```ts
import Net from 'rbx-net';
let nameOfEvent = Net.GetEvent("NameOfEvent");

// Using .Connect
nameOfEvent.Connect((...args: any[]) => void {

});

// Using Event
nameOfEvent.Event.Connect((...args: any[]) => void {

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
let exampleOne = Net.CreateFunction("NameOfFunction");

// second way of doing it
let exampleTwo = new Net.ServerFunction("NameOfFunction");
```


Getting
------------


### client-side
```ts
import Net from 'rbx-net';
let getFunctionOne = Net.GetClientFunction("NameOfFunction");
let getFunctionTwo = Net.GetClientFunctionAsync("NameOfFunction").then(func => {
    // do stuff with func
}, err => {
    // handle errors
});
let getFunctionThree = new Net.ClientFunction("NameOfFunction");
```

### server-side
```ts
import Net from 'rbx-net';
let getFunctionOne = Net.GetServerFunction("NameOfFunction");
let getFunctionTwo = Net.GetServerFunctionAsync("NameOfFunction").then(func => {
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
let nameOfFunction = Net.GetServerFunction("NameOfFunction");


let result = nameOfFunction.CallPlayerAsync(player, "Hello, World!").then( (...response : any[]) => void {
    print(...reponse); // will print what the client sends back to the server. :-)
}, err => {
    // handle any errors from not being able to recieve messages from the client. :-)
})
```


### client-side
```ts
import Net from 'rbx-net';
let nameOfFunction = Net.GetClientFunction("NameOfFunction");

// Will yield until the result is retrieved (note, this can also break your script!)
let result = nameOfFunction.CallServer("Hello, World!"); 
print(result);

// Will run asynchronously and handle errors. This is recommended to be used as your server-side code could throw errors!
nameOfFunction.CallServerAsync("Hello, World!").then((...result: any[]) => void {
    print(...result);
}, err => {
    // handle errors here. :-)
})
```


Recieving
--------------

```ts
import Net from 'rbx-net';
let nameOfFunction = Net.GetServerFunction("NameOfFunction");
nameOfFunction.Callback((...args: any[])=> void {
    return "Hello, World!";
});
```

Caching
-------------
You can also set a cache timer on the RemoteFunction so a client will cache the result for a set amount of time.
```ts
import Net from 'rbx-net';
let nameOfFunction = Net.GetServerFunction("NameOfFunction");
nameOfFunction.ClientCache = 10; // will set a cache timer of 10 seconds.

// NOTE: ClientCache cannot be written on the client.
```