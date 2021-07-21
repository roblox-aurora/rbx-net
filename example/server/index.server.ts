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

@Net.Serialization.Serializable()
class Person {
	public constructor(private name: string, private age: number) {}
}
