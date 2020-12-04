import NetClientAsyncFunction from "./class/NetClientAsyncFunction";
import NetClientEvent from "./class/NetClientEvent";

new NetClientEvent("Say").SendToServer("Hello, World!");

new NetClientAsyncFunction("TestAysnc").CallServerAsync("Hello there").then((result) => print(result));
