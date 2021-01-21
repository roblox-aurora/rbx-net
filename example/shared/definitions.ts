import Net from "@rbxts/net";
import t from "@rbxts/t";
import { createTypeChecker } from "./middleware";
import createLoggerMiddleware from "./middleware/LoggerMiddleware";

const Remotes = Net.Definitions.Create({
	TestDefinition: Net.Definitions.Event<[message: string]>([
		Net.Middleware.Logging(),
		Net.Middleware.TypeChecking(t.string),
	]),
	TestFun: Net.Definitions.Function(),
});
export default Remotes;
