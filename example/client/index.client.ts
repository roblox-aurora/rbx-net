import Net from "@rbxts/net";
import Remotes from "./definitions";

const testFunctions = Remotes.Client.Group("TestingFunctions");
const testEvents = Remotes.Client.Group("TestingEvents");

const add = testFunctions.Get("CallServerAndAddNumbers");

add.CallServerAsync(10, 10).then((result) => {
	if (result === 20) {
		print("RESULT IS 20");
	} else {
		error("RESULT IS WRONG");
	}
});

testEvents.Get("PrintMessage").SendToServer("Hello, World!");
