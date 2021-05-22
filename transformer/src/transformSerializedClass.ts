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
		[factory.createReturnStatement(factory.createObjectLiteralExpression(bindingElements))],
		true,
	);
}

export function getSerializedInterfaceName(declaration: ts.ClassDeclaration) {
	return `_serialized_${declaration.name?.text ?? ""}`;
}

export function generateSerializedInterface(declaration: ts.ClassDeclaration) {
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

	const int = factory.createInterfaceDeclaration(
		undefined,
		undefined,
		getSerializedInterfaceName(declaration),
		undefined,
		undefined,
		bindingElements,
	);
	return int;
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
						factory.createPropertyAccessExpression(serializedValueIdentifier, parameter.name.getText()),
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
						serializedValueIdentifier,
						factory.createIdentifier(member.name.getText()),
					),
				),
			);
		}
	}

	return factory.createBlock(
		[
			factory.createVariableStatement(
				undefined,
				factory.createVariableDeclarationList(
					[
						factory.createVariableDeclaration(
							id,
							undefined,
							factory.createTypeReferenceNode(declaration.name?.text ?? ""),
							useDefault
								? factory.createCallExpression(
										factory.createPropertyAccessExpression(
											factory.createIdentifier(declaration.name?.text ?? ""),
											"default",
										),
										undefined,
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
