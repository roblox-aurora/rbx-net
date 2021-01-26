-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local _0 = TS.import(script, script.Parent.Parent, "configuration")
local DebugLog = _0.DebugLog
local DebugWarn = _0.DebugWarn
local _1 = TS.import(script, script.Parent.Parent, "internal")
local getRemoteOrThrow = _1.getRemoteOrThrow
local IS_SERVER = _1.IS_SERVER
local waitForRemote = _1.waitForRemote
local HttpService = game:GetService("HttpService")
--[[
	*
	* An event that behaves like a function
	* @rbxts client
]]
local ClientAsyncFunction
do
	ClientAsyncFunction = setmetatable({}, {
		__tostring = function()
			return "ClientAsyncFunction"
		end,
	})
	ClientAsyncFunction.__index = ClientAsyncFunction
	function ClientAsyncFunction.new(...)
		local self = setmetatable({}, ClientAsyncFunction)
		self:constructor(...)
		return self
	end
	function ClientAsyncFunction:constructor(name)
		self.timeout = 10
		self.listeners = {}
		self.instance = getRemoteOrThrow("AsyncRemoteFunction", name)
		local _2 = not IS_SERVER
		assert(_2, "Cannot create a Net.ClientAsyncFunction on the Server!")
	end
	function ClientAsyncFunction:Wait(name)
		return TS.Promise.defer(TS.async(function(resolve)
			TS.await(waitForRemote("AsyncRemoteFunction", name, 10))
			resolve(ClientAsyncFunction.new(name))
		end))
	end
	function ClientAsyncFunction:SetCallTimeout(timeout)
		local _2 = timeout > 0
		assert(_2, "timeout must be a positive number")
		self.timeout = timeout
	end
	function ClientAsyncFunction:GetCallTimeout()
		return self.timeout
	end
	function ClientAsyncFunction:SetCallback(callback)
		if self.connector then
			self.connector:Disconnect()
			self.connector = nil
		end
		self.connector = self.instance.OnClientEvent:Connect(TS.async(function(...)
			local args = { ... }
			local _2 = args
			local eventId = _2[1]
			local data = _2[2]
			local _3 = eventId
			local _4 = type(_3) == "string"
			if _4 then
				local _5 = data
				_4 = type(_5) == "table"
			end
			if _4 then
				local result = callback(unpack(data))
				if TS.Promise.is(result) then
					local _5 = result
					local _6 = function(promiseResult)
						self.instance:FireServer(eventId, promiseResult)
					end
					_5:andThen(_6):catch(function(err)
						warn("[rbx-net] Failed to send response to server: " .. err)
					end)
				else
					self.instance:FireServer(eventId, result)
				end
			else
				warn("Recieved message without eventId")
			end
		end))
	end
	ClientAsyncFunction.CallServerAsync = TS.async(function(self, ...)
		local args = { ... }
		local id = HttpService:GenerateGUID(false)
		local _2 = self.instance
		local _3 = {}
		for _4, _5 in pairs(args) do
			_3[_4] = _5
		end
		_2:FireServer(id, _3)
		return TS.Promise.new(function(resolve, reject)
			local startTime = tick()
			DebugLog("Connected CallServerAsync EventId", id)
			local connection
			connection = self.instance.OnClientEvent:Connect(function(...)
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
					if eventId == id then
						DebugLog("Disconnected CallServerAsync EventId", eventId)
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
					game:GetService("RunService").Heartbeat:Wait()
				end
			until not (connection.Connected and tick() < startTime + self.timeout)
			local _7 = self.listeners
			local _8 = id
			-- ▼ Map.delete ▼
			_7[_8] = nil
			-- ▲ Map.delete ▲
			if tick() >= startTime and connection.Connected then
				DebugWarn("(timeout) Disconnected CallServerAsync EventId", id)
				connection:Disconnect()
				reject("Request to server timed out after " .. tostring(self.timeout) .. " seconds")
			end
		end)
	end)
end
return {
	default = ClientAsyncFunction,
}
