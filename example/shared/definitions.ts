import Net from "@rbxts/net";
import t from "@rbxts/t";

// type $GuidTree<K extends string, T> = { readonly [P in keyof T]: `guid@${K}:${P & string}` };
// declare function $guids<K extends string, T extends Record<string, true>>(namespace: K, values: T): $GuidTree<K, T>;
// const { Name } = $guids("Test", {
// 	Name: true,
// });

const { Create, Group, Event, Function, AsyncFunction, ServerToClientEvent, ClientToServerEvent } = Net.Definitions;

const Remotes = Create(
	{
		TestDefinition: Event<[message: string]>([Net.Middleware.Logging(), Net.Middleware.TypeChecking(t.string)]),
		TestFun: Function(),
		TestFun2: AsyncFunction<(message: string) => boolean>(),
		TestEvent: ServerToClientEvent(),
		SubGroup: Group({
			TestFun3: Function(),
			AnotherGroup: Group({
				TestFun4: Function(),
			}),
		}),
		Test: Net.Definitions.ServerToClientEvent(),
		Test2: Net.Definitions.ClientToServerEvent<[test: string]>(),
		Test3: Net.Definitions.ClientToServerEvent([
			Net.Middleware.TypeChecking((value: unknown): value is string => true),
		]),
		Test4: Net.Definitions.BidirectionalEvent(),
		Test5: Net.Definitions.CallServerAsyncFunction<(arg: string) => number>(), // ?
		Test6: Net.Definitions.CallClientAsyncFunction<(arg: string) => number>(),
	},
	[
		Net.Definitions.GlobalReadonlyMiddleware((remote, data, player) => {
			print("call from", player, "via", remote, ...data);
		}),
	],
);

export default Remotes;
