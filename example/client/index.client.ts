import Net from "@rbxts/net";

Net.Client.SetConfiguration("EnableDebugMessages", true);

const say = new Net.Client.Event("Say");
say.SendToServer("Hello, World!");
say.SendToServer("Should throw");

Net.Client.GetAsyncFunctionAsync("TestAsync").then((event) => {
	event.CallServerAsync("Hello there").then((result) => print("result 1", result));
	event
		.CallServerAsync("Hello there... again?")
		.then((result) => print(result))
		.catch((err) => warn("failed: " + tostring(err)));
});

// ensure no conflict
Net.Client.GetEvent("TestAsync");
