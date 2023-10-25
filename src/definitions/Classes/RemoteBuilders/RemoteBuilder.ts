import { ClientCallbackMiddleware, ServerCallbackMiddleware, ServerInvokeMiddleware } from "../../../middleware";

export type CheckLike<T> = (value: unknown) => value is T;
export abstract class RemoteBuilder<TServer extends object, TClient extends object> {
	public readonly serverCallbackMiddleware = new Array<ServerCallbackMiddleware>();
	public readonly serverCallerMiddleware = new Array<ServerInvokeMiddleware>();

	public readonly clientCallbackMiddleware = new Array<ClientCallbackMiddleware>();

	public abstract OnServer(): TServer;
	public abstract OnClient(): TClient;
}

export interface Serialized<T extends string> {
	$class: T;
}

export interface Serializable<T> {
	Serialize(): T;
}

export interface SerializeClass<TClass extends unknown, TSerialized extends Serialized<string>> {
	new (): Serializable<TSerialized>;
	Deserialize(ser: TSerialized): TClass;
}
