import Net from "@rbxts/net";
import t from "@rbxts/t";
import Remotes from "./definitions";

const standalone = Remotes.Server.Create("TestStandaloneEvent");
const testFunctions = Remotes.Server.GetNamespace("TestingFunctions");
const testEvents = Remotes.Server.GetNamespace("TestingEvents");

testFunctions.OnFunction("CallServerAndAddNumbers", (_, a, b) => a + b);
testEvents.OnEvent("PrintMessage", print);
const testLegacy = Remotes.Server.GetNamespace("Legacy").Create("LegacyFunction");
const testLegacy2 = Remotes.Client.GetNamespace("Legacy").Get("LegacyFunction");

testFunctions.Create("CallServerAndAddNumbers").SetCallback((_, a, b) => a + b);

type GlobalNamespace = Net.Util.GetDeclarationDefinitions<typeof Remotes>;
type GlobalNamespaceAsServerRemotes = Net.Util.GetServerRemotes<GlobalNamespace>;
type GlobalNamespaceAsClientRemotes = Net.Util.GetClientRemotes<GlobalNamespace>;

type NamespaceTest = Net.Util.GetNamespaceDefinitions<GlobalNamespace, "TestingEvents">;
type TestNamespaceAsServerRemotes = Net.Util.GetServerRemotes<NamespaceTest>;
type TestNamespaceAsClientRemotes = Net.Util.GetClientRemotes<NamespaceTest>;

Remotes.Server.Get("Srv").Connect((message) => {});

Remotes.Server.GetNamespace("TestingFunctions").OnFunction("CallServerAndAddNumbers", async () => {
	return 10;
});

testEvents.Get("PrintMessage").Predict(undefined!, "Test");
