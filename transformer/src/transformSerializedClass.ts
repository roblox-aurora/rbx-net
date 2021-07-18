import ts, { assign, factory } from "byots";
import chalk from "chalk";
import { formatTransformerDiagnostic } from "./shared";

export function generateSerializedMembers(declaration: ts.ClassDeclaration, useDefault: boolean) {
	const bindingElements = new Array<ts.PropertyAssignment>();

	for (const member of declaration.members) {
		if (ts.isConstructorDeclaration(member)) {
			for (const parameter of member.parameters) {
				const isPrivate = parameter.modifiers?.find(
					(f) =>
						ts.isModifier(f) &&
						[
							ts.SyntaxKind.PrivateKeyword,
							ts.SyntaxKind.ProtectedKeyword,
							ts.SyntaxKind.PublicKeyword,
						].includes(f.kind),
				);
				if (isPrivate && !useDefault) {
					bindingElements.push(
						factory.createPropertyAssignment(
							parameter.name.getText(),
							factory.createPropertyAccessExpression(
								factory.createThis(),
								factory.createIdentifier(parameter.name.getText()),
							),
						),
					);
				} else if (!useDefault) {
					throw formatTransformerDiagnostic(
						`Constructor should be empty, or each parameter should be marked ${chalk.blue(
							"private",
						)}, ${chalk.blue("protected")}, ${chalk.blue("public")} - or have a ${chalk.magenta(
							"@Net.Serialization.Parameter",
						)}('${chalk.green(parameter.name.getText())}')`,
						parameter,
					);
				}
			}
		}
		if (ts.isPropertyDeclaration(member)) {
			bindingElements.push(
				factory.createPropertyAssignment(
					member.name.getText(),
					factory.createPropertyAccessExpression(
						factory.createThis(),
						factory.createIdentifier(member.name.getText()),
					),
				),
			);
		}
	}

	return factory.createBlock(
		[
			factory.createReturnStatement(
				factory.createObjectLiteralExpression([
					factory.createPropertyAssignment("Value", factory.createObjectLiteralExpression(bindingElements)),
					factory.createPropertyAssignment(
						"Class",
						factory.createStringLiteral(declaration.name?.text ?? ""),
					),
				]),
			),
		],
		true,
	);
}

export function getSerializedInterfaceName(declaration: ts.ClassDeclaration, value = true) {
	return value ? `$_Value${declaration.name?.text ?? ""}` : `$_Serialized${declaration.name?.text ?? ""}`;
}

export function generateSerializedInterface(declaration: ts.ClassDeclaration, typeChecker: ts.TypeChecker) {
	const bindingElements = new Array<ts.TypeElement>();

	for (const member of declaration.members) {
		if (ts.isConstructorDeclaration(member)) {
			for (const parameter of member.parameters) {
				const isPrivate = parameter.modifiers?.find(
					(f) =>
						ts.isModifier(f) &&
						[
							ts.SyntaxKind.PrivateKeyword,
							ts.SyntaxKind.ProtectedKeyword,
							ts.SyntaxKind.PublicKeyword,
						].includes(f.kind),
				);

				if (isPrivate) {
					bindingElements.push(
						factory.createPropertySignature(
							undefined,
							factory.createIdentifier(parameter.name.getText()),
							undefined,
							parameter.type,
						),
					);
					console.log("add", parameter.name.getText());
				}
			}
		}
		if (ts.isPropertyDeclaration(member)) {
			bindingElements.push(
				factory.createPropertySignature(
					undefined,
					factory.createIdentifier(member.name.getText()),
					undefined,
					member.type,
				),
			);
		}
	}

	const int = [
		factory.createInterfaceDeclaration(
			undefined,
			undefined,
			getSerializedInterfaceName(declaration),
			declaration.typeParameters,
			undefined,
			bindingElements,
		),
		factory.createInterfaceDeclaration(
			undefined,
			undefined,
			getSerializedInterfaceName(declaration, false),
			declaration.typeParameters,
			undefined,
			[
				factory.createPropertySignature(
					undefined,
					"Class",
					undefined,
					factory.createLiteralTypeNode(factory.createStringLiteral(declaration.name?.text ?? "")),
				),
				factory.createPropertySignature(
					undefined,
					"Value",
					undefined,
					factory.createTypeReferenceNode(
						getSerializedInterfaceName(declaration),
						convertTypeParametersToArguments(declaration.typeParameters),
					),
				),
			],
		),
	];
	return int;
}

export function convertTypeParametersToArguments(
	params: ts.NodeArray<ts.TypeParameterDeclaration> | undefined,
): ts.TypeNode[] {
	const arr = new Array<ts.TypeNode>();
	if (params) {
		for (const param of params) {
			const node = factory.createTypeReferenceNode(param.name.text);
			arr.push(node);
		}
	}
	return arr;
}

export function generateDeserializeMembers(
	declaration: ts.ClassDeclaration,
	serializedValueIdentifier: ts.Identifier,
	useDefault: boolean,
) {
	const constructorArguments = new Array<ts.Expression>();
	const assignments = new Array<ts.BinaryExpression>();
	const id = factory.createUniqueName("object");

	for (const member of declaration.members) {
		if (ts.isConstructorDeclaration(member)) {
			for (const parameter of member.parameters) {
				const isPrivate = parameter.modifiers?.find(
					(f) =>
						ts.isModifier(f) &&
						[
							ts.SyntaxKind.PrivateKeyword,
							ts.SyntaxKind.ProtectedKeyword,
							ts.SyntaxKind.PublicKeyword,
						].includes(f.kind),
				);
				if (isPrivate) {
					constructorArguments.push(
						factory.createPropertyAccessExpression(
							factory.createPropertyAccessExpression(serializedValueIdentifier, "Value"),
							parameter.name.getText(),
						),
					);
				}
			}
		}
		if (ts.isPropertyDeclaration(member)) {
			assignments.push(
				factory.createBinaryExpression(
					factory.createPropertyAccessExpression(id, factory.createIdentifier(member.name.getText())),
					factory.createToken(ts.SyntaxKind.EqualsToken),
					factory.createPropertyAccessExpression(
						factory.createPropertyAccessExpression(serializedValueIdentifier, "Value"),
						factory.createIdentifier(member.name.getText()),
					),
				),
			);
		}
	}

	return factory.createBlock(
		[
			factory.createExpressionStatement(
				factory.createCallExpression(
					factory.createIdentifier("assert"),
					[],
					[
						factory.createBinaryExpression(
							factory.createCallExpression(factory.createIdentifier("typeIs"), undefined, [
								serializedValueIdentifier,
								factory.createStringLiteral("table"),
							]),
							factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
							factory.createBinaryExpression(
								factory.createPropertyAccessExpression(serializedValueIdentifier, "Class"),
								factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
								factory.createStringLiteral(declaration.name?.text ?? ""),
							),
						),
						factory.createStringLiteral(
							"Expected Serialized object of type " + declaration.name?.text ?? "",
						),
					],
				),
			),
			factory.createVariableStatement(
				undefined,
				factory.createVariableDeclarationList(
					[
						factory.createVariableDeclaration(
							id,
							undefined,
							factory.createTypeReferenceNode(
								declaration.name?.text ?? "",
								convertTypeParametersToArguments(declaration.typeParameters),
							),
							useDefault
								? factory.createCallExpression(
										factory.createPropertyAccessExpression(
											factory.createIdentifier(declaration.name?.text ?? ""),
											"default",
										),
										convertTypeParametersToArguments(declaration.typeParameters),
										[],
								  )
								: factory.createNewExpression(
										factory.createIdentifier(declaration.name?.text ?? ""),
										undefined,
										constructorArguments,
								  ),
						),
					],
					ts.NodeFlags.Const,
				),
			),
			...assignments.map((a) => factory.createExpressionStatement(a)),
			factory.createReturnStatement(id),
		],
		true,
	);
}
