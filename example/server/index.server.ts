import Net from "@rbxts/net";
import t from "@rbxts/t";
import Remotes from "./definitions";
import { createRateLimiter, createTypeChecker, NetMiddleware } from "./middleware";
import createLoggerMiddleware from "./middleware/LoggerMiddleware";

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

Net.Server.CreateListener(
	"Say",
	[createLoggerMiddleware(), createRateLimiter({ MaxRequestsPerMinute: 1 }), createTypeChecker(t.string)],
	async (player, message) => {
		await wait(1);
		print(`${player}: ${message}`);
	},
);

Remotes.Server.OnEvent("TestDefinition", (message: string) => {
	print("Server Recieved", message);
});

const test = Remotes.Server.Group("SubGroup");
print("SubGroup", test);

new Net.Server.Event("test");

const tester = new Net.Server.AsyncFunction("TestAsync", [createTypeChecker(t.string)]);
tester.SetCallback((player, message) => `Message was: "${message}" from ${player}`);

const [AddNumbers, ServerPrint] = Net.Server.CreateEvents(
	["AddNumbers", createTypeChecker(t.number, t.number)],
	"print",
); // ?
AddNumbers.Connect((_, a, b) => print(`${a} + ${b} = ${a + b}`));
ServerPrint.Connect((player, ...args) => print("client", ...args));

function wrap<T extends unknown[]>(fn: (obj: string, ...args: T) => void) {
	return (player: Player, ...args: T) => {
		const name = player.GetFullName();
		fn(name, ...args);
	};
}

new Net.Server.Event<[string]>("Test").Connect(
	wrap((obj, arg1) => {
		print(obj, arg1);
	}),
);
