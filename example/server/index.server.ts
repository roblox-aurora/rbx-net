import Net from "@rbxts/net";
import t from "@rbxts/t";
import NetServerAsyncFunction from "./class/NetServerAsyncFunction";
import NetServerEventV2 from "./class/NetServerEvent";
import { createTypeChecker, Middleware } from "./middleware";

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

Net.CreateServerListener("Say", [createTypeChecker(t.string)], async (player, message) => {
	await wait(5);
	print(`${player}: ${message}`);
});

declare const mwTest: Middleware<unknown[], unknown[], string>;

const tester = new NetServerAsyncFunction("TestAysnc", [createTypeChecker(t.string)]);
tester.SetCallback((player, message) => `Message was: "${message}" from ${player}`);
