import Net from "@rbxts/net";
import t from "@rbxts/t";
import Remotes from "./definitions";
import NetSerialization from "./serialization";

const standalone = Remotes.Server.Create("TestStandaloneEvent");
const testFunctions = Remotes.Server.GetNamespace("TestingFunctions");
const testEvents = Remotes.Server.GetNamespace("TestingEvents");

testFunctions.OnFunction("CallServerAndAddNumbers", (_, a, b) => a + b);
testEvents.OnEvent("PrintMessage", print);
const testLegacy = Remotes.Server.GetNamespace("Legacy").Create("LegacyFunction");
const testLegacy2 = Remotes.Client.GetNamespace("Legacy").Get("LegacyFunction");

testFunctions.Create("CallServerAndAddNumbers").SetCallback((_, a, b) => a + b);

class Result<T extends defined, E extends defined> {
	private constructor(protected okValue: T | undefined, protected errValue: E | undefined) {}
	public isOk(): this is { okValue: T; errValue: undefined } {
		return this.okValue !== undefined;
	}
	public isErr(): this is { errValue: E } {
		return this.errValue !== undefined;
	}

	public static ok<T>(value: T) {
		return new Result(value, undefined);
	}
}
Net.Serialization.AddSerializer("Result", Result, (value) => {
	return {
		Ok: value.isOk() ? value.okValue : undefined,
		Err: value.isErr() ? value.errValue : undefined,
	};
})(Result.ok(10));
Net.Serialization.AddDeserializer("Result", Result, (value) => {
	return Result.ok(10);
});
