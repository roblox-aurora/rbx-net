-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.TS.RuntimeLib)
local AsyncFunction = TS.import(script, script, "ClientAsyncFunction").default
local Event = TS.import(script, script, "ClientEvent").default
local CrossServerEvent = TS.import(script, script, "GlobalClientEvent").default
local config = TS.import(script, script.Parent, "configuration")
local ClientEvent = TS.import(script, script, "ClientEvent").default
local ClientAsyncFunction = TS.import(script, script, "ClientAsyncFunction").default
local _0 = TS.import(script, script, "ClientFunction")
local ClientFunction = _0.default
local Function = _0.default
local SetConfiguration = config.SetClientConfiguration
local GetConfiguration = config.GetConfiguration
local function GetEvent(id)
	return ClientEvent.new(id)
end
local GetEventAsync = TS.async(function(id)
	return ClientEvent:Wait(id)
end)
local GetFunctionAsync = TS.async(function(id)
	return ClientFunction:Wait(id)
end)
local GetAsyncFunctionAsync = TS.async(function(id)
	return ClientAsyncFunction:Wait(id)
end)
local function GetAsyncFunction(id)
	return ClientAsyncFunction.new(id)
end
return {
	GetEvent = GetEvent,
	GetEventAsync = GetEventAsync,
	GetFunctionAsync = GetFunctionAsync,
	GetAsyncFunctionAsync = GetAsyncFunctionAsync,
	GetAsyncFunction = GetAsyncFunction,
	SetConfiguration = SetConfiguration,
	GetConfiguration = GetConfiguration,
	Event = Event,
	AsyncFunction = AsyncFunction,
	CrossServerEvent = CrossServerEvent,
	Function = Function,
}
