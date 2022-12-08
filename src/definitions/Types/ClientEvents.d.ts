import {
	RemoteDeclarations,
	DeclarationsOf,
	FilterClientDeclarations,
	ServerToClientEventDeclaration,
	BidirectionalEventDeclaration,
} from ".";

export type ClientEventDeclarationKeys<T extends RemoteDeclarations> = keyof DeclarationsOf<
	FilterClientDeclarations<T>,
	ServerToClientEventDeclaration<any> | BidirectionalEventDeclaration<any, any>
> &
	string;

export type GetClientEventParams<T> = T extends ServerToClientEventDeclaration<infer A> ? [...A] : never;
