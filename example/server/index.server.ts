import Net from "@rbxts/net";
import t from "@rbxts/t";
import { createRateLimiter, createTypeChecker } from "./middleware";

Net.Server.SetConfiguration("EnableDebugMessages", true);

async function wait(time: number) {
	return Promise.defer<void>((resolve) => {
		let i = 0;
		while (i < time) {
			const [, step] = game.GetService("RunService").Stepped.Wait();
			i += step;
		}
		print("waited " + time + " seconds");
		resolve();
	});
}

Net.Server.CreateListener("Say", [createRateLimiter(1), createTypeChecker(t.string)], async (player, message) => {
	await wait(1);
	print(`${player}: ${message}`);
});

new Net.Server.Event("test");

const tester = new Net.Server.AsyncFunction("TestAsync", [createTypeChecker(t.string)]);
tester.SetCallback((player, message) => `Message was: "${message}" from ${player}`);

const [AddNumbers, ServerPrint] = Net.Server.CreateEvents(
	["AddNumbers", createTypeChecker(t.number, t.number)],
	"print",
); // ?
AddNumbers.Connect((_, a, b) => print(`${a} + ${b} = ${a + b}`));
ServerPrint.Connect((player, ...args) => print("client", ...args));

const Test = Net.Server.CreateEvents("Hello");

new Net.Server.CrossServerEvent("Testing");
