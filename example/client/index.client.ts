import Net from "@rbxts/net";

new Net.Client.Event("Say").SendToServer("Hello, World!");
new Net.Client.AsyncFunction("TestAysnc").CallServerAsync("Hello there").then((result) => print(result));
