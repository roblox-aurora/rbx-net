import Net from "@rbxts/net";
import t from "@rbxts/t";
import { createTypeChecker } from "./middleware";

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

Net.Server.CreateListener("Say", [createTypeChecker(t.string)], async (player, message) => {
	await wait(5);
	print(`${player}: ${message}`);
});

const tester = new Net.Server.AsyncFunction("TestAysnc", [createTypeChecker(t.string)]);
tester.SetCallback((player, message) => `Message was: "${message}" from ${player}`);
