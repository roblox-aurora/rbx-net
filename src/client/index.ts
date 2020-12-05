export { default as AsyncFunction } from "./NetClientAsyncFunction";
export { default as Event } from "./NetClientEvent";
export { default as CrossServerEvent } from "./NetGlobalClientEvent";
import { waitForEvent } from "../internal";
import config from "../configuration";
import NetClientEvent from "./NetClientEvent";
import NetClientAsyncFunction from "./NetClientAsyncFunction";

export const SetConfiguration = config.SetClientConfiguration;
export const GetConfiguration = config.GetConfiguration;

export function GetEvent(id: string) {
	return new NetClientEvent(id);
}

export async function GetEventAsync(id: string) {
	return NetClientEvent.Wait(id);
}

export async function GetAsyncFunctionAsync(id: string) {
	return NetClientAsyncFunction.Wait(id);
}

export function GetAsyncFunction(id: string) {
	return new NetClientAsyncFunction(id);
}
