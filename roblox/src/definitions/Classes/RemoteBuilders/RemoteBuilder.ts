import { ClientCallbackMiddleware, ServerCallbackMiddleware, ServerInvokeMiddleware } from "../../../middleware";

export interface ServerBuilder<TServer> {
	serverCallbackMiddleware: Array<ServerCallbackMiddleware>;
	OnServer(): TServer;
}

export interface ClientBuilder<TClient> {
	clientCallbackMiddleware: Array<ClientCallbackMiddleware>;
	OnClient(): TClient;
}

export type CheckLike<T> = (value: unknown) => value is T;
export abstract class RemoteBuilder<TServer extends object, TClient extends object>
	implements ServerBuilder<TServer>, ClientBuilder<TClient>
{
	public serverCallbackMiddleware = new Array<ServerCallbackMiddleware>();
	public serverCallerMiddleware = new Array<ServerInvokeMiddleware>();

	public clientCallbackMiddleware = new Array<ClientCallbackMiddleware>();

	public abstract OnServer(): TServer;
	public abstract OnClient(): TClient;
}
