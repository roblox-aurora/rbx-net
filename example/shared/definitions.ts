import Net from "@rbxts/net";
import t from "@rbxts/t";

// type $GuidTree<K extends string, T> = { readonly [P in keyof T]: `guid@${K}:${P & string}` };
// declare function $guids<K extends string, T extends Record<string, true>>(namespace: K, values: T): $GuidTree<K, T>;
// const { Name } = $guids("Test", {
// 	Name: true,
// });

const { Create, Group, Event, Function, AsyncFunction, ServerEvent, ClientEvent } = Net.Definitions;

const Remotes = Create({
	TestDefinition: Event<[message: string]>([Net.Middleware.Logging(), Net.Middleware.TypeChecking(t.string)]),
	TestFun: Function(),
	TestFun2: AsyncFunction<(message: string) => boolean>(),
	SubGroup: Group({
		TestFun3: Function(),
		AnotherGroup: Group({
			TestFun4: Function(),
		}),
	}),
	Test: Net.Definitions.ServerEvent<[test: string]>(),
	Test2: Net.Definitions.ClientEvent<[test: string]>(),
});

Remotes.Server.Create("Test").SendToPlayer;
Remotes.Server.Create("Test2").Connect;
Remotes.Client.Get("Test").Connect;
Remotes.Client.Get("Test2").SendToServer;

Remotes.Server.Create("TestDefinition").Connect();

export default Remotes;
