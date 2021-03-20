import Net from "@rbxts/net";
import t from "@rbxts/t";
import Remotes from "./definitions";

const testFunctions = Remotes.Server.Group("TestingFunctions");
testFunctions.Create("CallServerAndAddNumbers").SetCallback((_, a, b) => a + b);
