import Net from "@rbxts/net";
import t from "@rbxts/t";
import { createTypeChecker } from "./middleware";

const Remotes = Net.Definitions({
	TestDefinition: {
		Type: "Event",
		ServerMiddleware: [createTypeChecker(t.string)],
	},
});
export default Remotes;
