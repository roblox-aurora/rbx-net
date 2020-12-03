
local TS = _G[script]
local _0 = TS.import(script, script.Parent, "internal")
local findOrCreateRemote = _0.findOrCreateRemote
local IS_CLIENT = _0.IS_CLIENT
local checkArguments = _0.checkArguments
local errorft = _0.errorft
local throttler = TS.import(script, script.Parent, "Throttle")
local GetConfiguration = TS.import(script, script.Parent, "configuration").GetConfiguration
local Players = game:GetService("Players")
--[[
	*
	* An event on the server
	* @rbxts server
]]
local NetServerEvent
do
	NetServerEvent = setmetatable({}, {
		__tostring = function()
			return "NetServerEvent"
		end,
	})
	NetServerEvent.__index = NetServerEvent
	function NetServerEvent.new(...)
		local self = setmetatable({}, NetServerEvent)
		self:constructor(...)
		return self
	end
	function NetServerEvent:constructor(name, ...)
		local recievedPropTypes = { ... }
		self.maxRequestsPerMinute = 0
		self.instance = findOrCreateRemote("RemoteEvent", name)
		assert(not IS_CLIENT, "Cannot create a Net.ServerEvent on the Client!")
		self.clientRequests = throttler:Get("Event~" .. name)
		if #recievedPropTypes > 0 then
			self.propTypes = recievedPropTypes
		end
	end
	function NetServerEvent:Unmanaged(name)
		return findOrCreateRemote("RemoteEvent", name)
	end
	function NetServerEvent:Group(list)
		local map = {}
		for key, value in pairs(list) do
			local _1 = value
			local _2 = value
			local _3 = value
			if type(_1) == "table" then
				local item = NetServerEvent.new(key, unpack(value))
				local _4 = map
				local _5 = key
				local _6 = item
				
				_4[_5] = _6
				
			elseif type(_2) == "boolean" then
				local _4 = map
				local _5 = key
				local _6 = NetServerEvent.new(key)
				
				_4[_5] = _6
				
			elseif type(_3) == "function" then
				local event = NetServerEvent.new(key)
				event:Connect(value)
			end
		end
		return map
	end
	function NetServerEvent:PureReciever(name, cb, ...)
		local recievedPropTypes = { ... }
		local event = NetServerEvent.new(name, unpack(recievedPropTypes))
		event:Connect(cb)
		return event
	end
	function NetServerEvent:PureSender(name, ...)
		local recievedPropTypes = { ... }
		local event = NetServerEvent.new(name, unpack(recievedPropTypes))
		return event
	end
	function NetServerEvent:WithStrictCall(...)
		local callPropTypes = { ... }
		self.callTypes = callPropTypes
		return self
	end
	function NetServerEvent:GetInstance()
		return self.instance
	end
	function NetServerEvent:GetEvent()
		return self.instance.OnServerEvent
	end
	function NetServerEvent:Connect(callback)
		if self.propTypes ~= nil then
			return self:GetEvent():Connect(function(sourcePlayer, ...)
				local args = { ... }
				local maxRequests = self.maxRequestsPerMinute
				if maxRequests > 0 then
					local clientRequestCount = self.clientRequests:Get(sourcePlayer)
					if clientRequestCount >= maxRequests then
						errorft(GetConfiguration("ServerThrottleMessage"), {
							player = sourcePlayer.UserId,
							remote = self.instance.Name,
							limit = maxRequests,
						})
					else
						self.clientRequests:Increment(sourcePlayer)
					end
				end
				if checkArguments(self.propTypes, args) then
					callback(sourcePlayer, unpack(args))
				end
			end)
		else
			return self:GetEvent():Connect(callback)
		end
	end
	function NetServerEvent:SendToAllPlayers(...)
		local args = { ... }
		if self.callTypes ~= nil then
			if not checkArguments(self.callTypes, args) then
				return nil
			end
		end
		self.instance:FireAllClients(unpack(args))
	end
	function NetServerEvent:SendToAllPlayersExcept(blacklist, ...)
		local args = { ... }
		if self.callTypes ~= nil then
			if not checkArguments(self.callTypes, args) then
				return nil
			end
		end
		local _1 = blacklist
		local _2 = blacklist
		if typeof(_1) == "Instance" then
			local _3 = Players:GetPlayers()
			local _4 = function(p)
				return p ~= blacklist
			end
			
			local _5 = {}
			local _6 = 0
			for _7, _8 in ipairs(_3) do
				if _4(_8, _7 - 1, _3) == true then
					_6 += 1
					_5[_6] = _8
				end
			end
			
			local otherPlayers = _5
			for _, player in ipairs(otherPlayers) do
				self.instance:FireClient(player, unpack(args))
			end
		elseif type(_2) == "table" then
			for _, player in ipairs(Players:GetPlayers()) do
				local _3 = blacklist
				local _4 = player
				if (table.find(_3, _4) or 0) - 1 == -1 then
					self.instance:FireClient(player, unpack(args))
				end
			end
		end
	end
	function NetServerEvent:SendToPlayer(player, ...)
		local args = { ... }
		if self.callTypes ~= nil then
			if not checkArguments(self.callTypes, args) then
				return nil
			end
		end
		self.instance:FireClient(player, unpack(args))
	end
	function NetServerEvent:SendToPlayers(players, ...)
		local args = { ... }
		if self.callTypes ~= nil then
			if not checkArguments(self.callTypes, args) then
				return nil
			end
		end
		for _, player in ipairs(players) do
			self:SendToPlayer(player, unpack(args))
		end
	end
	function NetServerEvent:SetRateLimit(requestsPerMinute)
		self.maxRequestsPerMinute = requestsPerMinute
		local clientValue = self.instance:FindFirstChild("RateLimit")
		if clientValue then
			clientValue.Value = requestsPerMinute
		else
			clientValue = Instance.new("IntValue", self.instance)
			clientValue.Name = "RateLimit"
			clientValue.Value = requestsPerMinute
		end
	end
	function NetServerEvent:GetRateLimit()
		return self.maxRequestsPerMinute
	end
end
return {
	default = NetServerEvent,
}
