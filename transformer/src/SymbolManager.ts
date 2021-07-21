import ts from "byots";
import { formatTransformerDiagnostic } from "./shared";

const SERIALIZER_DECORATORS = {
	Serializable: "Serializable",
	Default: "Default",
};

export default class NetSymbolManager {
	public decoratorSymbols = new Map<string, ts.Symbol>();

	public constructor(private moduleSourceFile: ts.SourceFile, serializerSourceFile: ts.SourceFile) {
		const netSerialization = serializerSourceFile.locals?.get(ts.escapeLeadingUnderscores("NetSerialization"));
		if (netSerialization) {
			for (const [mapName, symbName] of Object.entries(SERIALIZER_DECORATORS)) {
				const sym = netSerialization.exports?.get(ts.escapeLeadingUnderscores(symbName));
				if (sym) {
					this.decoratorSymbols.set(mapName, sym);
					console.log("set", mapName, sym.getName());
				}
			}
		}
	}
}
