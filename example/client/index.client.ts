import Net from "@rbxts/net";

const say = new Net.Client.Event("Say");
say.SendToServer("Hello, World!");
say.SendToServer("Should throw");

Net.Client.GetAsyncFunctionAsync("TestAsync").then((event) => {
	event.CallServerAsync("Hello there").then((result) => print(result));
	event
		.CallServerAsync(10)
		.then((result) => print(result))
		.catch((err) => warn("failed: " + tostring(err)));
});
