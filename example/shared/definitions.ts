import Net from "@rbxts/net";
import t from "@rbxts/t";
import { $print } from "rbxts-transform-debug";
import { NetMiddleware } from "./middleware";
import { types } from "./validation";
import { RemoteBuilder, Serializable, Serialized } from "./definitions/Classes/RemoteBuilders/RemoteBuilder";

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
	.AddNamespace("test", {
		x: Net.Definitions.AsyncFunction().OnServer(),
		y: Net.Definitions.Event().OnClient(),
		z: Net.Definitions.Create()
			.Add({
				a: Net.Definitions.AsyncFunction().OnServer(),
			})
			.ToNamespace(),
	})
	.AddServerRemote("test2", Net.Definitions.AsyncFunction())
	.Build().Server;

Remotes.Server.Get("Test4Event");

export default Remotes;
