
local TS = _G[script]
local _0 = TS.import(script, script.Parent, "internal")
local findOrCreateRemote = _0.findOrCreateRemote
local IS_CLIENT = _0.IS_CLIENT
local checkArguments = _0.checkArguments
local _1 = TS.import(script, script.Parent, "configuration")
local DebugLog = _1.DebugLog
local DebugWarn = _1.DebugWarn
local HttpService = game:GetService("HttpService")
--[[
	*
	* An event that behaves like a function
	* @rbxts server
]]
local NetServerAsyncFunction
do
	NetServerAsyncFunction = setmetatable({}, {
		__tostring = function()
			return "NetServerAsyncFunction"
		end,
	})
	NetServerAsyncFunction.__index = NetServerAsyncFunction
	function NetServerAsyncFunction.new(...)
		local self = setmetatable({}, NetServerAsyncFunction)
		self:constructor(...)
		return self
	end
	function NetServerAsyncFunction:constructor(name, ...)
		local recievedPropTypes = { ... }
		self.timeout = 10
		self.listeners = {}
		self.instance = findOrCreateRemote("AsyncRemoteFunction", name)
		assert(not IS_CLIENT, "Cannot create a Net.ServerAsyncFunction on the Client!")
		if #recievedPropTypes > 0 then
			self.propTypes = recievedPropTypes
		end
	end
	function NetServerAsyncFunction:GetCallTimeout()
		return self.timeout
	end
	function NetServerAsyncFunction:SetCallTimeout(timeout)
		assert(timeout > 0, "timeout must be a positive number")
		self.timeout = timeout
	end
	function NetServerAsyncFunction:SetCallback(callback)
		if self.connector then
			self.connector:Disconnect()
			self.connector = nil
		end
		self.connector = self.instance.OnServerEvent:Connect(TS.async(function(player, ...)
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
				
				if self.propTypes == nil or checkArguments(self.propTypes, data) then
					local result = callback(player, unpack(data))
					if TS.Promise.is(result) then
						local _5 = result
						local _6 = function(promiseResult)
							self.instance:FireClient(player, eventId, promiseResult)
						end
						_5:andThen(_6):catch(function(err)
							warn("[rbx-net] Failed to send response to client: " .. err)
						end)
					else
						self.instance:FireClient(player, eventId, result)
					end
				else
					warn("[rbx-net] Client failed type checks")
				end
			else
				warn("[rbx-net-async] Recieved message without eventId")
			end
		end))
	end
	NetServerAsyncFunction.CallPlayerAsync = TS.async(function(self, player, ...)
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
			
			_4[_5] = _6
			
			repeat
				do
					game:GetService("RunService").Stepped:Wait()
				end
			until not (connection.Connected and tick() < startTime + self.timeout)
			local _7 = self.listeners
			local _8 = id
			
			_7[_8] = nil
			
			if tick() >= startTime and connection.Connected then
				DebugWarn("(timeout) Disconnected CallPlayerAsync EventId", id)
				connection:Disconnect()
				reject("Request to client timed out")
			end
		end)
	end)
end
return {
	default = NetServerAsyncFunction,
}
