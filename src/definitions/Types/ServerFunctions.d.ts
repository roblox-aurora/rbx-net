import {
	RemoteDeclarations,
	DeclarationsOf,
	FilterServerDeclarations,
	AsyncServerFunctionDeclaration,
	InferServerCallback,
} from ".";

export type ServerFunctionDeclarationKeys<T extends RemoteDeclarations> = keyof DeclarationsOf<
	FilterServerDeclarations<T>,
	AsyncServerFunctionDeclaration<any, any>
> &
	string;

type ServerFunctionCallbackFunction<T extends RemoteDeclarations, K extends keyof T> = InferServerCallback<
	Extract<T[K], AsyncServerFunctionDeclaration<any, any>>
>;
