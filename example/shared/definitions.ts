import Net from "@rbxts/net";
import { Option, Result } from "@rbxts/rust-classes";
import { $print } from "rbxts-transform-debug";
import { NetSerializer } from "./serialization";

const {
	Create,
	Namespace,
	ServerAsyncFunction,
	ServerToClientEvent,
	ClientToServerEvent,
	ServerFunction,
	BidirectionalEvent,
	ExperienceBroadcastEvent,
	EXPERIMENTAL_ExperienceReplicatedEvent,
} = Net.Definitions;

export interface NetOk<T extends defined> {
	readonly type: "Ok";
	readonly value: T;
}
export interface NetErr<E extends defined> {
	readonly type: "Err";
	readonly err: E;
}
export type NetResult<T extends defined, E extends defined> = NetOk<T> | NetErr<E>;

export interface NetSome<T extends defined> {
	readonly Type: "Some";
	readonly Value: T;
}
export interface NetNone {
	readonly Type: "None";
}
export type NetOption<T extends defined> = NetSome<T> | NetNone;

const ResultSerializer = NetSerializer.CustomClass(Result, {
	Serialize<T extends defined, E extends defined>(value: Result<T, E>): NetResult<T, E> {
		return value.match<NetResult<T, E>>(
			(value) => ({
				type: "Ok",
				value: value,
			}),
			(err) => ({
				type: "Err",
				err,
			}),
		);
	},
	Deserialize<T extends defined, E extends defined>(value: NetResult<T, E>): Result<T, E> {
		if (value.type === "Ok") {
			return Result.ok(value.value);
		} else {
			return Result.err(value.err);
		}
	},
});

const OptionSerializer = NetSerializer.CustomClass(Option, {
	Serialize<T extends defined>(value: Option<T>): NetOption<T> {
		return value.match<NetOption<T>>(
			(value) => ({ Type: "Some", Value: value }),
			() => ({ Type: "None" }),
		);
	},
	Deserialize<T extends defined>(value: NetOption<T>): Option<T> {
		if (value.Type === "Some") {
			return Option.some(value.Value);
		} else {
			return Option.none();
		}
	},
});

class Person {
	public constructor(public name: string, public age: number) {}

	public static Deserialize(value: { name: string; age: number }) {
		return new Person(value.name, value.age);
	}

	public Serialize() {
		return {
			name: this.name,
			age: this.age,
		};
	}
}

const PersonSerializer = NetSerializer.Class(Person);

const Remotes = Create(
	{
		TestStandaloneEvent: ServerToClientEvent<[message2: string]>(),
		TestStandaloneClientEvent: ClientToServerEvent<[message: string]>(),
		TestingFunctions: Namespace({
			CallServerAndAddNumbers: ServerAsyncFunction<(a: number, b: number) => number>(),
		}),
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
	},
	{
		ServerGlobalMiddleware: [
			Net.Middleware.Global((remote, data, player) => {
				$print("call from", player, "via", remote, ...data);
			}),
		],
		Serializers: [ResultSerializer, PersonSerializer, OptionSerializer],
	},
);

export default Remotes;
