import {
	RemoteDeclarations,
	DeclarationsOf,
	FilterServerDeclarations,
	ClientToServerEventDeclaration,
	BidirectionalEventDeclaration,
	InferServerConnect,
} from ".";

export type ServerEventDeclarationKeys<T extends RemoteDeclarations> = keyof DeclarationsOf<
	FilterServerDeclarations<T>,
	ClientToServerEventDeclaration<any> | BidirectionalEventDeclaration<any, any>
> &
	string;

export type ServerEventConnectFunction<T extends RemoteDeclarations, K extends keyof T> = InferServerConnect<
	Extract<T[K], ClientToServerEventDeclaration<any> | BidirectionalEventDeclaration<any, any>>
>;
