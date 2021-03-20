import Net from "@rbxts/net";
import t from "@rbxts/t";
import Remotes from "./definitions";

const standalone = Remotes.Server.Create("TestStandaloneEvent");
const testFunctions = Remotes.Server.Group("TestingFunctions");
const testEvents = Remotes.Server.Group("TestingEvents");

testFunctions.OnFunction("CallServerAndAddNumbers", (_, a, b) => a + b);
testEvents.OnEvent("PrintMessage", print);
const testLegacy = Remotes.Server.Group("Legacy").Create("LegacyFunction");
const testLegacy2 = Remotes.Client.Group("Legacy").Get("LegacyFunction");

testFunctions.Create("CallServerAndAddNumbers").SetCallback((_, a, b) => a + b);
