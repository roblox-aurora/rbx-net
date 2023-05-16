export const enum RequestType {
	ServerToClientRequest,
	ClientToServerResponse,

	ClientToServerRequest,
	ServerToClientResponse,
}

export type AsyncListenerArgs<T extends readonly unknown[] = unknown[]> = [
	eventId: string,
	type: RequestType.ClientToServerResponse | RequestType.ClientToServerRequest,
	data: T,
];

export type ServerAsyncListener<T extends readonly unknown[]> = (player: Player, ...args: AsyncListenerArgs<T>) => void;
export type ClientAsyncListener<T extends readonly unknown[]> = (...args: AsyncListenerArgs<T>) => void;

export type AsyncRequestArgs<T extends readonly unknown[] = unknown[]> = [
	eventId: string,
	type: RequestType.ServerToClientRequest | RequestType.ClientToServerRequest,
	request: T,
];
export type AsyncResponseArgs<T extends unknown = unknown> = [
	eventId: string,
	type: RequestType.ServerToClientResponse | RequestType.ClientToServerResponse,
	response: AsyncResult<T, string>,
];

export type ServerListenerDelegate<T extends readonly unknown[]> = (player: Player, ...args: T) => void;
export type ClientListenerDelegate<T extends readonly unknown[]> = (...args: T) => void;

export type ServerAsyncRemoteCallback<Req extends readonly unknown[], Res extends unknown> =
	// | AsyncSendRequest<Req>
	AsyncSendResponse<Res>;

export type ClientAsyncRemoteCallback<Req extends readonly unknown[], Res extends unknown> =
	// | AsyncSendRequest<Req>
	AsyncSendResponse<Res>;

export type AsyncSendResponse<T extends unknown = unknown> = (...args: AsyncResponseArgs<T>) => void;
export type AsyncSendRequest<T extends readonly unknown[]> = (...args: AsyncRequestArgs<T>) => void;

export type AsyncOk<T> = { type: "Ok"; value: T };
export type AsyncErr<E> = { type: "Err"; err: E };
export type AsyncResult<T, E> = AsyncOk<T> | AsyncErr<E>;

export function isAsyncRequest(value: AsyncResponseArgs | AsyncRequestArgs): value is AsyncRequestArgs {
	return value[1] === RequestType.ServerToClientRequest;
}

export function isAsyncResponse(value: AsyncResponseArgs | AsyncRequestArgs): value is AsyncResponseArgs {
	return value[1] === RequestType.ClientToServerResponse;
}
