import Net from "@rbxts/net";
import t from "@rbxts/t";
import { $print } from "rbxts-transform-debug";
import { NetMiddleware } from "./middleware";

// type $GuidTree<K extends string, T> = { readonly [P in keyof T]: `guid@${K}:${P & string}` };
// declare function $guids<K extends string, T extends Record<string, true>>(namespace: K, values: T): $GuidTree<K, T>;
// const { Name } = $guids("Test", {
// 	Name: true,
// });

const {
	Create,
	Namespace,
	ServerAsyncFunction,
	Event,
	AsyncFunction,
	ServerToClientEvent,
	ClientToServerEvent,
	ServerFunction,
	BidirectionalEvent,
	ExperienceBroadcastEvent,
	EXPERIMENTAL_ExperienceReplicatedEvent,
} = Net.Definitions;

const Remotes = Create(
	{
		TestStandaloneEvent: ServerToClientEvent<[message2: string]>(),
		TestStandaloneClientEvent: ClientToServerEvent<[message: string]>(),
		TestingFunctions: Namespace({
			CallServerAndAddNumbers: ServerAsyncFunction<(a: number, b: number) => number>(),
		}),
		NS: Create()
			.Add({
				X: AsyncFunction().OnServer(),
			})
			.ToNamespace(),
		TestingEvents: Namespace({
			PrintMessage: ClientToServerEvent<[message: string]>(),
		}),
		Legacy: Namespace({
			LegacyEvent: BidirectionalEvent<[message: string], [message2: number]>(),
			LegacyFunction: ServerFunction<(server: number) => string>(),
			LegacyAsyncFunction: ServerAsyncFunction<(server: number) => string>(),
		}),
		Srv: ExperienceBroadcastEvent<{ text: string }>(),
		Srv2: EXPERIMENTAL_ExperienceReplicatedEvent<[test: string]>(),
		Testv4: AsyncFunction()
			.EnsureArguments<[value: string]>(t.string)
			.EnsureReturns(t.string)
			.WithRateLimit({
				MaxRequestsPerMinute: 10,
			})
			.OnServer(),
		Test4Event: Event().EnsureArguments<[test: string]>(t.string).OnServer(),
		Test4Bi: Event().EnsureArguments<[test: string]>(t.string).OnServer(),
	},
	{
		ServerGlobalMiddleware: [
			Net.Middleware.Global((remote, data, player) => {
				$print("call from", player, "via", remote, ...data);
			}),
		],
	},
);

const BuilderRemotes = Net.Definitions.Create()
	// Create a namespacae using an object model
	.AddNamespace("ExampleNamespaceObject", {
		ExampleEvent: Net.Definitions.Event().EnsureArguments(t.string).OnServer(), // Event for server taht takes
	})
	// Create a namespace using another builder + object model
	.AddNamespace(
		"ExampleNamespaceUsingInnerBuilder",
		Net.Definitions.Create().Add({
			// Example object-like
			ExampleAsyncFunction: Net.Definitions.AsyncFunction().OnClient(),
		}),
	)
	// Create a namespace with a builder functionally
	.AddNamespace(
		"ExampleNamespaceUsingFunctionalBuilder",
		builder => {
			// You can add remotes one by one functionally like this
			return builder
				.AddClientRemote("ClientRemoteName", Net.Definitions.AsyncFunction())
				.AddServerRemote("ServerRemoteName", Net.Definitions.Event());
		}, // add a client remote using a function
	)
	// Of course like our inner builder, we can use 'Add' here.
	.Add({
		ExampleBaseRemote: Net.Definitions.AsyncFunction().OnServer(),
		// Can add a created definition as a namespace to an object model
		ToNamespaceBehaviour: Net.Definitions.Create().ToNamespace(),
	})
	.AddServerRemote("NamedBaseServerRemoteFunction", Net.Definitions.AsyncFunction())
	.AddClientRemote("NamedBaseClientRemoteEvent", Net.Definitions.Event())
	.Build();

Remotes.Server.Get("Test4Event");

export default Remotes;
