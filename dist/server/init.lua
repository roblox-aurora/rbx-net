-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.TS.RuntimeLib)
local AsyncFunction = TS.import(script, script, "ServerAsyncFunction").default
local _0 = TS.import(script, script, "ServerEvent")
local ServerEvent = _0.default
local Event = _0.default
local CrossServerEvent = TS.import(script, script, "GlobalServerEvent").default
local CreateListener = TS.import(script, script, "CreateServerListener").default
local Function = TS.import(script, script, "ServerFunction").default
local config = TS.import(script, script.Parent, "configuration")
--[[
	*
	* Creates an event on the server
	*
	* Programmatically equivalent to `new Net.Server.Event(name, middleware)`
	*
	* @param name The name of the event
	* @param middleware The middleware attached to this event
]]
local function CreateEvent(name, middleware)
	return ServerEvent.new(name, middleware)
end
--[[
	*
	* Creates an event on the server
	* Same as `CreateEvent`, but type-wise removes `Connect`.
]]
local CreateSender = CreateEvent
--[[
	*
	* Creates a function on the server
	*
	* Programmatically equivalent to `new Net.Server.AsyncFunction(name, middleware)`
	*
	* @param name The name of the function
	* @param middleware The middleware attached to this function
]]
local function CreateAsyncFunction(name, middleware)
	if middleware == nil then
		middleware = {}
	end
	return AsyncFunction.new(name, middleware)
end
--[[
	*
	* An event declaration
]]
--[[
	*
	* Creates multiple server events by name, or declaration
	*
	* An example of a simple list of events is:
	*
	* ```ts
	* const [eventA, eventB] = Net.Server.CreateEvents("A", "B");
	* ```
	* Both `eventA` and `eventB` will be generic server events. If you want to include middleware, you can do:
	*
	* ```ts
	* const [eventA, middlewareEventB] = Net.Server.CreateEvents(
	* 	"A",
	* 	["B", createTypeChecker(t.string)]
	* )
	* ```
	* In this instance, it would be like doing `const middlewareEventB = new Net.Server.Event("B", [createTypeChecker(t.string)])`
	* Event A would still take any arguments, and Event B would take specific arguments (in this case, `string`)
]]
local function CreateEvents(...)
	local evts = { ... }
	local evtMap = {}
	for _, id in ipairs(evts) do
		local _1 = id
		if type(_1) == "string" then
			local _2 = evtMap
			local _3 = ServerEvent.new(id)
			-- ▼ Array.push ▼
			_2[#_2 + 1] = _3
			-- ▲ Array.push ▲
		else
			local _2 = id
			local name = _2[1]
			local middleware = { select(2, unpack(id)) }
			local _3 = evtMap
			local _4 = ServerEvent.new(name, middleware)
			-- ▼ Array.push ▼
			_3[#_3 + 1] = _4
			-- ▲ Array.push ▲
		end
	end
	return unpack(evtMap)
end
--[[
	*
	* Set a configuration value for the server
]]
local SetConfiguration = config.SetConfiguration
--[[
	*
	* Get a configuration value for the server
]]
local GetConfiguration = config.GetConfiguration
return {
	CreateEvent = CreateEvent,
	CreateAsyncFunction = CreateAsyncFunction,
	CreateEvents = CreateEvents,
	Event = Event,
	AsyncFunction = AsyncFunction,
	Function = Function,
	CrossServerEvent = CrossServerEvent,
	CreateListener = CreateListener,
	CreateSender = CreateSender,
	SetConfiguration = SetConfiguration,
	GetConfiguration = GetConfiguration,
}
