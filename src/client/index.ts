import { default as AsyncFunction } from "./ClientAsyncFunction";
import { default as Event } from "./ClientEvent";
import { default as CrossServerEvent } from "./GlobalClientEvent";
import config from "../configuration";
import ClientEvent from "./ClientEvent";
import ClientAsyncFunction from "./ClientAsyncFunction";

export const SetConfiguration = config.SetClientConfiguration;
export const GetConfiguration = config.GetConfiguration;

export function GetEvent(id: string) {
	return new ClientEvent(id);
}

export async function GetEventAsync(id: string) {
	return ClientEvent.Wait(id);
}

export async function GetAsyncFunctionAsync(id: string) {
	return ClientAsyncFunction.Wait(id);
}

export function GetAsyncFunction(id: string) {
	return new ClientAsyncFunction(id);
}

export { Event, AsyncFunction, CrossServerEvent };
