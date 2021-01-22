-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.TS.RuntimeLib)
local CreateNetDefinitionBuilder = TS.import(script, script, "CreateDefinitions").default
local NetDefinitions = {}
do
	local _0 = NetDefinitions
	local Create = CreateNetDefinitionBuilder
	_0.Create = Create
	local function AsyncFunction(mw)
		return {
			Type = "AsyncFunction",
			ServerMiddleware = mw,
		}
	end
	_0.AsyncFunction = AsyncFunction
	local function Function(mw)
		return {
			Type = "Function",
			ServerMiddleware = mw,
		}
	end
	_0.Function = Function
	local function Event(mw)
		return {
			Type = "Event",
			ServerMiddleware = mw,
		}
	end
	_0.Event = Event
end
local default = NetDefinitions
return {
	default = default,
}
