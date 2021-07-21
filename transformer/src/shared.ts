import chalk from "chalk";
import path from "path";
import ts from "byots";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const name = `[${require("../package.json").name}]`;

export function getDebugInfo(node: ts.Node) {
	const sourceFile = node.getSourceFile();
	const linePos = sourceFile.getLineAndCharacterOfPosition(node.getStart());
	const relativePath = path.relative(process.cwd(), node.getSourceFile().fileName).replace(/\\/g, "/");
	return {
		sourceFile,
		linePos: linePos.line + 1,
		relativePath,
	};
}

export function formatTransformerDebug(message: string, node?: ts.Node): string {
	if (node) {
		const info = getDebugInfo(node);
		const str = `${chalk.gray(name)} ${chalk.green("macro debug")} ${chalk.cyan(info.relativePath)}:${chalk.yellow(
			info.linePos,
		)} - ${message}\n${chalk.italic(node.getText())}`;
		return str;
	} else {
		return `${chalk.gray(name)} ${chalk.green("macro debug")} - ` + message;
	}
}

export function formatTransformerInfo(message: string, node?: ts.Node): string {
	if (node) {
		const str = `${chalk.gray(name)} ${chalk.cyan("macro info")} - ${message}\n${chalk.italic(node.getText())}`;
		return str;
	} else {
		return `${chalk.gray(name)} ${chalk.cyan("macro info")} ` + message;
	}
}

export function formatTransformerWarning(message: string, node?: ts.Node, suggestion?: string): string {
	if (node) {
		const info = getDebugInfo(node);
		let str = `${chalk.gray(name)} ${chalk.yellow("macro warning")} ${chalk.cyan(info.relativePath)}:${chalk.yellow(
			info.linePos,
		)} - ${message}\n${chalk.italic(node.getText())}`;

		if (suggestion !== undefined) {
			str += "\n* " + chalk.yellow(suggestion);
		}

		return str;
	} else {
		return `${chalk.gray(name)} ${chalk.yellow("macro warning")} - ` + message;
	}
}

export function formatTransformerDiagnostic(message: string, node?: ts.Node, suggestion?: string): string {
	if (node) {
		const info = getDebugInfo(node);
		let str = `${chalk.gray(name)} ${chalk.red("macro error")} ${chalk.cyan(info.relativePath)}:${chalk.yellow(
			info.linePos,
		)} - ${message}\n${chalk.italic(node.getText())}`;

		if (suggestion !== undefined) {
			str += "\n* " + chalk.yellow(suggestion);
		}

		return str;
	} else {
		return `${chalk.gray(name)} ${chalk.red("macro error")} - ` + message;
	}
}
