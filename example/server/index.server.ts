import Net from "@rbxts/net";
import t from "@rbxts/t";
import { createTypeChecker } from "./middleware";

Net.CreateServerListener("test", [createTypeChecker(t.string)], (...args: unknown[]) => {
	print(...args);
});
