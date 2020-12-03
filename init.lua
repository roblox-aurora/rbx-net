
local TS = _G[script]
local throttler = TS.import(script, script, "Throttle")
local Serializer = TS.import(script, script, "Serializer")
local config = TS.import(script, script, "configuration")
local _0 = TS.import(script, script, "internal")
local functionExists = _0.functionExists
local eventExists = _0.eventExists
local ServerTickFunctions = _0.ServerTickFunctions
local NetServerEvent = TS.import(script, script, "ServerEvent").default
local NetClientEvent = TS.import(script, script, "ClientEvent").default
local NetClientFunction = TS.import(script, script, "ClientFunction").default
local NetServerFunction = TS.import(script, script, "ServerFunction").default
local NetServerThrottledFunction = TS.import(script, script, "ServerThrottledFunction").default
local NetServerThrottledEvent = TS.import(script, script, "ServerThrottledEvent").default
local NetGlobalEvent = TS.import(script, script, "GlobalEvent").default
local NetGlobalServerEvent = TS.import(script, script, "GlobalServerEvent").default
local NetServerAsyncFunction = TS.import(script, script, "ServerAsyncFunction").default
local NetClientAsyncFunction = TS.import(script, script, "ClientAsyncFunction").default
local runService = game:GetService("RunService")
local IS_CLIENT = (__LEMUR__ and not runService:IsServer()) or runService:IsClient()
local IS_SERVER = runService:IsServer()
--[[
	*
	* Typescript Networking Library for ROBLOX
]]
local Net = {}
do
	local _1 = Net
	local SetConfiguration = config.SetConfiguration
	_1.SetConfiguration = SetConfiguration
	local SetClientConfiguration = config.SetClientConfiguration
	_1.SetClientConfiguration = SetClientConfiguration
	local GetConfiguration = config.GetConfiguration
	_1.GetConfiguration = GetConfiguration
	--[[
		*
		* Version information
		* @internal
	]]
	local VERSION = {
		number = {
			major = 1,
			minor = 2,
			revision = 0,
		},
		date = 190602,
		tag = IS_LUA_MODULE ~= nil and "lua" or "ts",
	}
	_1.VERSION = VERSION
	setmetatable(VERSION, {
		__tostring = function(self)
			local _2 = self.number
			local major = _2.major
			local minor = _2.minor
			local revision = _2.revision
			return tostring(major) .. "." .. tostring(minor) .. "." .. tostring(revision) .. (IS_LUA_MODULE ~= nil and "-lua" or "")
		end,
	})
	local ServerEvent = NetServerEvent
	_1.ServerEvent = ServerEvent
	local ClientEvent = NetClientEvent
	_1.ClientEvent = ClientEvent
	local ClientFunction = NetClientFunction
	_1.ClientFunction = ClientFunction
	local ClientAsyncFunction = NetClientAsyncFunction
	_1.ClientAsyncFunction = ClientAsyncFunction
	local ServerFunction = NetServerFunction
	_1.ServerFunction = ServerFunction
	local ServerAsyncFunction = NetServerAsyncFunction
	_1.ServerAsyncFunction = ServerAsyncFunction
	local GlobalEvent = NetGlobalEvent
	_1.GlobalEvent = GlobalEvent
	local GlobalServerEvent = NetGlobalServerEvent
	_1.GlobalServerEvent = GlobalServerEvent
	
	local ServerThrottledEvent = NetServerThrottledEvent
	_1.ServerThrottledEvent = ServerThrottledEvent
	
	
	local ServerThrottledFunction = NetServerThrottledFunction
	_1.ServerThrottledFunction = ServerThrottledFunction
	
	local function IsClient()
		return IS_CLIENT
	end
	_1.IsClient = IsClient
	local function IsServer()
		return IS_SERVER
	end
	_1.IsServer = IsServer
	local Serialize = Serializer.Serialize
	_1.Serialize = Serialize
	local Deserialize = Serializer.Deserialize
	_1.Deserialize = Deserialize
	local IsSerializable = Serializer.IsSerializable
	_1.IsSerializable = IsSerializable
	--[[
		*
		* Create a function
		* @param nameOrOptions The name of the function
		* @rbxts server
	]]
	local function CreateFunction(nameOrOptions)
		if IS_SERVER then
			local _2 = nameOrOptions
			if type(_2) == "string" then
				return NetServerFunction.new(nameOrOptions)
			else
				local fn = nameOrOptions.rateLimit ~= nil and NetServerThrottledFunction.new(nameOrOptions.name, nameOrOptions.rateLimit) or NetServerFunction.new(nameOrOptions.name)
				local _3 = nameOrOptions.callback
				if _3 ~= 0 and _3 == _3 and _3 ~= "" and _3 then
					fn:SetCallback(nameOrOptions.callback)
				end
				local _4 = nameOrOptions.cacheSeconds
				if _4 ~= 0 and _4 == _4 and _4 then
					fn:SetClientCache(nameOrOptions.cacheSeconds)
				end
				return fn
			end
		else
			error("Net.createFunction can only be used on the server!")
		end
	end
	_1.CreateFunction = CreateFunction
	--[[
		*
		* Creates a function that has a limited number of client requests every timeout (default 60 seconds)
		* @param name The name of the function
		* @param rateLimit The amount of requests allowed by clients in the rate timeout (default 60 seconds)
		* @rbxts server
	]]
	local function CreateThrottledFunction(name, rateLimit)
		if IS_SERVER then
			return NetServerThrottledFunction.new(name, rateLimit)
		else
			error("Net.createFunction can only be used on the server!")
		end
	end
	_1.CreateThrottledFunction = CreateThrottledFunction
	--[[
		*
		* Creates an event that has a limited number of client requests every timeout (default 60 seconds)
		* @param name The name of the event
		* @param rateLimit The amount of requests allowed by clients in the rate timeout (default 60 seconds)
		* @rbxts server
	]]
	local function CreateThrottledEvent(name, rateLimit)
		if IS_SERVER then
			return NetServerThrottledEvent.new(name, rateLimit)
		else
			error("Net.createFunction can only be used on the server!")
		end
	end
	_1.CreateThrottledEvent = CreateThrottledEvent
	--[[
		*
		* Create an event
		* @param name The name of the event
		* @rbxts server
	]]
	local function CreateEvent(name)
		if IS_SERVER then
			return NetServerEvent.new(name)
		else
			error("Net.createFunction can only be used on the server!")
		end
	end
	_1.CreateEvent = CreateEvent
	
	--[[
		*
		* Wait for a client function specified by `name`
		*
		* Usage
		*
		```ts
		Net.WaitForClientFunctionAsync("FunctionName").then(func => {
		func.Callback = clientCallbackFunction;
		}, err => {
		warn("Error fetching FunctionName:", err);
		});```
		*
		* Or inside an async function:
		```ts
		const func = await Net.WaitForClientFunctionAsync("FunctionName");
		func.Callback = clientCallbackFunction;
		```
		*
		* @param name The name of the function
		* @alias for `Net.ClientFunction.WaitFor(name)`
		* @returns `Promise<Net.ClientFunction>`
		* @rbxts client
	]]
	
	local WaitForClientFunctionAsync = TS.async(function(name)
		return NetClientFunction:WaitFor(name)
	end)
	_1.WaitForClientFunctionAsync = WaitForClientFunctionAsync
	
	--[[
		*
		* Wait for a client function specified by `name`
		*
		* Usage
		*
		```ts
		Net.WaitForClientEventAsync("EventName").then(event => {
		event.Connect(eventHandler);
		}, err => {
		warn("Error fetching EventName:", err);
		});```
		*
		* Or inside an async function:
		```ts
		const event = await Net.WaitForClientEventAsync("EventName");
		event.Connect(eventHandler);
		```
		*
		* @param name The name of the function
		* @alias for `Net.ClientEvent.WaitFor(name)`
		* @returns `Promise<Net.ClientEvent>`
		* @rbxts client
	]]
	
	local WaitForClientEventAsync = TS.async(function(name)
		return NetClientEvent:WaitFor(name)
	end)
	_1.WaitForClientEventAsync = WaitForClientEventAsync
	
	local function GetServerEventAsync(name)
		return TS.Promise.new(function(resolve, reject)
			if eventExists(name) then
				local newFunc = ServerEvent.new(name)
				resolve(newFunc)
			else
				reject("Could not find Server Event: " .. name .. " (did you create it on the server?)")
			end
		end)
	end
	_1.GetServerEventAsync = GetServerEventAsync
	
	local function GetServerFunctionAsync(name)
		return TS.Promise.new(function(resolve, reject)
			if functionExists(name) then
				local newFunc = NetServerFunction.new(name)
				resolve(newFunc)
			else
				reject("Could not find Server Function: " .. name .. " (did you create it?)")
			end
		end)
	end
	_1.GetServerFunctionAsync = GetServerFunctionAsync
	if IS_SERVER then
		local lastTick = 0
		local _2 = ServerTickFunctions
		local _3 = function()
			if tick() > lastTick + GetConfiguration("ServerThrottleResetTimer") then
				lastTick = tick()
				throttler:Clear()
			end
		end
		
		_2[#_2 + 1] = _3
		
	end
	--[[
		*
		* Creates a type guard array to be used in Net
		* @param value The types
	]]
	local function Types(...)
		local value = { ... }
		return value
	end
	_1.Types = Types
end
return Net
