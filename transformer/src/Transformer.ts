import ts, { factory } from "byots";
import { formatTransformerDebug, formatTransformerDiagnostic, formatTransformerInfo } from "./shared";
import NetSymbolManager from "./SymbolManager";
import {
	convertTypeParametersToArguments,
	generateDeserializeMembers,
	generateSerializedInterface,
	generateSerializedMembers,
	getSerializedInterfaceName,
} from "./transformSerializedClass";

export interface TransformerConfig {
	verbose?: boolean;
	DEV_moduleOverride?: string;
	skipModuleCheck?: boolean;
}

export default class TransformState {
	private readonly typeChecker: ts.TypeChecker;
	public constructor(
		private readonly program: ts.Program,
		private readonly context: ts.TransformationContext,
		private readonly config: TransformerConfig,
		private readonly symbolManager: NetSymbolManager,
	) {
		this.typeChecker = program.getTypeChecker();
	}

	private log(message: string, node?: ts.Node) {
		console.log(formatTransformerInfo(message, node));
	}

	private logDebug(message: string, node?: ts.Node) {
		if (this.config.verbose) {
			console.log(formatTransformerDebug(message, node));
		}
	}

	public getDefaultDecorator(cls: ts.ClassDeclaration, arr: ts.NodeArray<ts.Decorator> | undefined) {
		if (!arr) {
			return undefined;
		}

		for (const decorator of arr) {
			if (ts.isPropertyAccessExpression(decorator.expression) || ts.isIdentifier(decorator.expression)) {
				console.log("id");
				const symbol = this.typeChecker.getSymbolAtLocation(decorator.expression);
				if (symbol && symbol === this.symbolManager.decoratorSymbols.get("Default")) {
					if (
						!cls.members.find(
							(f) =>
								f.name?.getText() === "default" &&
								f.modifiers?.find((f) => f.kind === ts.SyntaxKind.StaticKeyword),
						)
					) {
						throw formatTransformerDiagnostic(
							"You have a `Default` decorator, but no `default()` static function.",
							decorator.expression,
						);
					}

					return {};
				}
			} else {
				console.log(ts.SyntaxKind[decorator.expression.kind]);
			}
		}
	}
	public getSerializationDecorator(arr: ts.NodeArray<ts.Decorator> | undefined) {
		if (!arr) {
			return undefined;
		}

		for (const decorator of arr) {
			if (ts.isCallExpression(decorator.expression)) {
				const { expression } = decorator.expression;
				const symbol = this.typeChecker.getSymbolAtLocation(expression);
				if (symbol && symbol === this.symbolManager.decoratorSymbols.get("Serializable")) {
					return {
						args: decorator.expression.arguments,
					};
				}
			}
		}
	}

	public visitNode(node: ts.Node): ts.Node;
	public visitNode(node: ts.Node): ts.Node | ts.Node[] {
		if (ts.isClassDeclaration(node)) {
			const serializer = this.getSerializationDecorator(node.decorators);
			if (serializer !== undefined) {
				const isDefault = this.getDefaultDecorator(node, node.decorators);

				return [
					...generateSerializedInterface(node, this.typeChecker),
					factory.updateClassDeclaration(
						node,
						node.decorators,
						node.modifiers,
						node.name,
						node.typeParameters,
						node.heritageClauses,
						[
							factory.createPropertyDeclaration(
								undefined,
								[factory.createModifier(ts.SyntaxKind.StaticKeyword)],
								factory.createIdentifier("serializedId"),
								undefined,
								undefined,
								factory.createStringLiteral(node.name?.text ?? ""),
							),
							...node.members,
							factory.createMethodDeclaration(
								undefined,
								[factory.createModifier(ts.SyntaxKind.PublicKeyword)],
								undefined,
								factory.createIdentifier("Serialize"),
								undefined,
								undefined,
								[],
								undefined,
								generateSerializedMembers(node, isDefault !== undefined),
							),
							factory.createMethodDeclaration(
								undefined,
								[factory.createModifier(ts.SyntaxKind.StaticKeyword)],
								undefined,
								factory.createIdentifier("deserialize"),
								undefined,
								node.typeParameters,
								[
									factory.createParameterDeclaration(
										undefined,
										undefined,
										undefined,
										"value",
										undefined,
										factory.createTypeReferenceNode(
											getSerializedInterfaceName(node, false),
											convertTypeParametersToArguments(node.typeParameters),
										),
									),
								],
								undefined,
								generateDeserializeMembers(
									node,
									factory.createIdentifier("value"),
									isDefault !== undefined,
								),
								// factory.createBlock([], false),
							),
						],
					),
					factory.createExpressionStatement(
						factory.createCallExpression(
							factory.createPropertyAccessExpression(
								factory.createPropertyAccessExpression(
									factory.createIdentifier("Net"),
									factory.createIdentifier("Serialization"),
								),
								factory.createIdentifier("AddSerializableClass"),
							),
							undefined,
							[factory.createIdentifier(node.name?.text ?? "")],
						),
					),
				];
			}
		}
		return node;
	}

	public visitNodeAndChildren(node: ts.Node): ts.Node | ts.Node[] {
		return ts.visitEachChild(
			this.visitNode(node),
			(childNode) => this.visitNodeAndChildren(childNode),
			this.context,
		);
	}

	public transformFile(file: ts.SourceFile) {
		// this.logDebug(`Transform file: ${file.fileName}`);
		return this.visitNodeAndChildren(file);
	}
}
