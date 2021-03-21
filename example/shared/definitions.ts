import Net from "@rbxts/net";
import t from "@rbxts/t";
import { $print } from "rbxts-transform-debug";

// type $GuidTree<K extends string, T> = { readonly [P in keyof T]: `guid@${K}:${P & string}` };
// declare function $guids<K extends string, T extends Record<string, true>>(namespace: K, values: T): $GuidTree<K, T>;
// const { Name } = $guids("Test", {
// 	Name: true,
// });

const {
	Create,
	Namespace,
	Event,
	Function,
	AsyncFunction,
	ServerAsyncFunction,
	ServerToClientEvent,
	ClientToServerEvent,
} = Net.Definitions;

const Remotes = Create(
	{
		TestStandaloneEvent: ServerToClientEvent<[]>(),
		TestingFunctions: Namespace({
			CallServerAndAddNumbers: ServerAsyncFunction<(a: number, b: number) => number>(),
		}),
		TestingEvents: Namespace({
			PrintMessage: ClientToServerEvent<[message: string]>(),
		}),
		Legacy: Namespace({
			LegacyEvent: Event<[message: string], [message2: number]>(),
			LegacyFunction: Function<(server: number) => string>(),
			LegacyAsyncFunction: AsyncFunction<(server: number) => string, (client: number) => string>(),
		}),
	},
	[
		Net.Middleware.Global((remote, data, player) => {
			$print("call from", player, "via", remote, ...data);
		}),
	],
);

export default Remotes;
