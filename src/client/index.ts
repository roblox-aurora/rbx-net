import { default as AsyncFunction } from "./ClientAsyncFunction";
import { default as Event } from "./ClientEvent";
import { default as CrossServerEvent } from "./ClientGameEvent";
import config from "../configuration";
import ClientEvent from "./ClientEvent";
import ClientAsyncFunction from "./ClientAsyncFunction";
import ClientFunction, { default as Function } from "./ClientFunction";

export const SetConfiguration = config.SetClientConfiguration;
export const GetConfiguration = config.GetConfiguration;

export function GetEvent<
	ConnectArgs extends ReadonlyArray<unknown> = Array<unknown>,
	CallArguments extends ReadonlyArray<unknown> = Array<unknown>
>(id: string) {
	return new ClientEvent<ConnectArgs, CallArguments>(id);
}

export async function GetEventAsync<
	ConnectArgs extends ReadonlyArray<unknown> = Array<unknown>,
	CallArguments extends ReadonlyArray<unknown> = Array<unknown>
>(id: string) {
	return ClientEvent.Wait<ConnectArgs, CallArguments>(id);
}

export async function GetFunctionAsync<
	CallArgs extends ReadonlyArray<unknown> = Array<unknown>,
	ServerReturnType = unknown
>(id: string) {
	return ClientFunction.Wait<CallArgs, ServerReturnType>(id);
}

export async function GetAsyncFunctionAsync<
	CallbackArgs extends ReadonlyArray<unknown> = Array<unknown>,
	CallArgs extends ReadonlyArray<unknown> = Array<unknown>,
	ServerReturnType = unknown
>(id: string) {
	return ClientAsyncFunction.Wait<CallbackArgs, CallArgs, ServerReturnType>(id);
}

export function GetAsyncFunction<
	CallbackArgs extends ReadonlyArray<unknown> = Array<unknown>,
	CallArgs extends ReadonlyArray<unknown> = Array<unknown>,
	ServerReturnType = unknown
>(id: string) {
	return new ClientAsyncFunction<CallbackArgs, CallArgs, ServerReturnType>(id);
}

export { Event, AsyncFunction, CrossServerEvent, Function };
