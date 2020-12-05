import Net from "@rbxts/net";

new Net.Client.Event("Say").SendToServer("Hello, World!");

Net.Client.GetAsyncFunctionAsync("TestAsync").then((event) => {
	event.CallServerAsync("Hello there").then((result) => print(result));
	event
		.CallServerAsync(10)
		.then((result) => print(result))
		.catch((err) => warn("failed: " + tostring(err)));
});
