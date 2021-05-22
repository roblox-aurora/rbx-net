/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import ts, { factory } from "byots";
import path from "path";
import { formatTransformerDebug, formatTransformerDiagnostic, formatTransformerWarning } from "./shared";
import NetSymbolManager from "./SymbolManager";
import TransformState from "./Transformer";

function visitNode(node: ts.SourceFile, program: ts.Program, config: NetTransformConfiguration): ts.SourceFile;
function visitNode(node: ts.Node, program: ts.Program, config: NetTransformConfiguration): ts.Node | undefined;
function visitNode(
	node: ts.Node,
	program: ts.Program,
	config: NetTransformConfiguration,
): ts.Node | ts.Node[] | undefined {
	return node;
}

function visitNodeAndChildren(
	node: ts.SourceFile,
	program: ts.Program,
	context: ts.TransformationContext,
	config: NetTransformConfiguration,
): ts.SourceFile;
function visitNodeAndChildren(
	node: ts.Node,
	program: ts.Program,
	context: ts.TransformationContext,
	config: NetTransformConfiguration,
): ts.Node | undefined;
function visitNodeAndChildren(
	node: ts.Node,
	program: ts.Program,
	context: ts.TransformationContext,
	config: NetTransformConfiguration,
): ts.Node | undefined {
	return ts.visitEachChild(
		visitNode(node, program, config),
		(childNode) => visitNodeAndChildren(childNode, program, context, config),
		context,
	);
}

export interface NetTransformConfiguration {
	verbose?: boolean;
	DEV_moduleOverride?: string;
	skipModuleCheck?: boolean;
}

const DEFAULTS: NetTransformConfiguration = {
	// useConstEnum: false,
	// EXPERIMENTAL_JSDocConstEnumUUID: false,
	// ConstEnumUUIDRequiresEnv: ["production"],
};

export default function transform(program: ts.Program, userConfiguration: NetTransformConfiguration) {
	userConfiguration = { ...DEFAULTS, ...userConfiguration };
	const { verbose, skipModuleCheck, DEV_moduleOverride: moduleOverride } = userConfiguration;

	if (verbose) {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		console.log(formatTransformerDebug("Running version " + require("../package.json").version));
	}

	const combinedModuleDir =
		moduleOverride !== undefined
			? path.join(process.cwd(), moduleOverride, "index.ts")
			: path.join(process.cwd(), "node_modules", "@rbxts", "net", "index.d.ts");

	const serializationDir =
		moduleOverride !== undefined
			? path.join(process.cwd(), moduleOverride, "serialization", "index.ts")
			: path.join(process.cwd(), "node_modules", "@rbxts", "net", "out", "serialization", "index.d.ts");

	if (verbose) {
		console.log(
			formatTransformerDebug(
				"Check against '" + combinedModuleDir + "' relative to " + program.getCompilerOptions().baseUrl ?? "",
			),
		);
	}

	const moduleSourceFile = program.getSourceFile(combinedModuleDir);
	const serializationSourceFile = program.getSourceFile(serializationDir);
	if (!moduleSourceFile || !serializationSourceFile) {
		console.log(
			formatTransformerWarning(
				"Transformer could not recognize module path '" + path.join(combinedModuleDir) + "'",
			),
		);
		return;
	}

	const symbolManager = new NetSymbolManager(moduleSourceFile, serializationSourceFile);

	return (context: ts.TransformationContext) => (file: ts.SourceFile) => {
		const state = new TransformState(program, context, userConfiguration, symbolManager);

		// return visitNodeAndChildren(file, program, context, userConfiguration);
		const transformed = state.transformFile(file);
		return transformed;
	};
}
