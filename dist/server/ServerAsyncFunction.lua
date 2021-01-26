-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local _0 = TS.import(script, script.Parent.Parent, "configuration")
local DebugLog = _0.DebugLog
local DebugWarn = _0.DebugWarn
local _1 = TS.import(script, script.Parent.Parent, "internal")
local findOrCreateRemote = _1.findOrCreateRemote
local IS_CLIENT = _1.IS_CLIENT
local MiddlewareEvent = TS.import(script, script.Parent, "MiddlewareEvent").default
local HttpService = game:GetService("HttpService")
local function isEventArgs(value)
	if #value < 2 then
		return false
	end
	local _2 = value
	local eventId = _2[1]
	local data = _2[2]
	local _3 = eventId
	local _4 = type(_3) == "string"
	if _4 then
		local _5 = data
		_4 = type(_5) == "table"
	end
	return _4
end
--[[
	*
	* An asynchronous function for two way communication between the client and server
]]
local ServerAsyncFunction
do
	local super = MiddlewareEvent
	ServerAsyncFunction = setmetatable({}, {
		__tostring = function()
			return "ServerAsyncFunction"
		end,
		__index = super,
	})
	ServerAsyncFunction.__index = ServerAsyncFunction
	function ServerAsyncFunction.new(...)
		local self = setmetatable({}, ServerAsyncFunction)
		self:constructor(...)
		return self
	end
	function ServerAsyncFunction:constructor(name, middlewares)
		if middlewares == nil then
			middlewares = {}
		end
		super.constructor(self, middlewares)
		self.timeout = 10
		self.listeners = {}
		self.instance = findOrCreateRemote("AsyncRemoteFunction", name)
		local _2 = not IS_CLIENT
		assert(_2, "Cannot create a NetServerAsyncFunction on the client!")
	end
	function ServerAsyncFunction:GetInstance()
		return self.instance
	end
	function ServerAsyncFunction:SetCallback(callback)
		if self.connector then
			self.connector:Disconnect()
			self.connector = nil
		end
		self.connector = self.instance.OnServerEvent:Connect(TS.async(function(player, ...)
			local args = { ... }
			if isEventArgs(args) then
				local _2 = args
				local eventId = _2[1]
				local data = _2[2]
				local _3 = self:_processMiddleware(callback)
				if _3 ~= nil then
					_3 = _3(player, unpack(data))
				end
				local result = _3
				if TS.Promise.is(result) then
					local _4 = result
					local _5 = function(promiseResult)
						self.instance:FireClient(player, eventId, promiseResult)
					end
					_4:andThen(_5):catch(function(err)
						warn("[rbx-net] Failed to send response to client: " .. err)
					end)
				else
					if result == nil then
						warn("[rbx-net-async] " .. self.instance.Name .. " returned undefined")
					end
					self.instance:FireClient(player, eventId, result)
				end
			else
				warn("[rbx-net-async] Recieved message without eventId")
			end
		end))
	end
	ServerAsyncFunction.CallPlayerAsync = TS.async(function(self, player, ...)
		local args = { ... }
		local id = HttpService:GenerateGUID(false)
		local _2 = self.instance
		local _3 = {}
		for _4, _5 in pairs(args) do
			_3[_4] = _5
		end
		_2:FireClient(player, id, _3)
		return TS.Promise.new(function(resolve, reject)
			local startTime = tick()
			DebugLog("Connected CallPlayerAsync EventId", id)
			local connection
			connection = self.instance.OnServerEvent:Connect(function(fromPlayer, ...)
				local recvArgs = { ... }
				local _4 = recvArgs
				local eventId = _4[1]
				local data = _4[2]
				local _5 = eventId
				local _6 = type(_5) == "string"
				if _6 then
					_6 = data ~= nil
				end
				if _6 then
					if player == player and eventId == id then
						DebugLog("Disconnected CallPlayerAsync EventId", eventId)
						connection:Disconnect()
						resolve(data)
					end
				end
			end)
			local _4 = self.listeners
			local _5 = id
			local _6 = {
				connection = connection,
				timeout = self.timeout,
			}
			-- ▼ Map.set ▼
			_4[_5] = _6
			-- ▲ Map.set ▲
			repeat
				do
					game:GetService("RunService").Stepped:Wait()
				end
			until not (connection.Connected and tick() < startTime + self.timeout)
			local _7 = self.listeners
			local _8 = id
			-- ▼ Map.delete ▼
			_7[_8] = nil
			-- ▲ Map.delete ▲
			if tick() >= startTime and connection.Connected then
				DebugWarn("(timeout) Disconnected CallPlayerAsync EventId", id)
				connection:Disconnect()
				reject("Request to client timed out")
			end
		end)
	end)
end
local default = ServerAsyncFunction
return {
	default = default,
}
