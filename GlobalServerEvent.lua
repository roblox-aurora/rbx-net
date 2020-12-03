
local TS = _G[script]
local NetServerEvent = TS.import(script, script.Parent, "ServerEvent").default
local _0 = TS.import(script, script.Parent, "GlobalEvent")
local NetGlobalEvent = _0.default
local isSubscriptionMessage = _0.isSubscriptionMessage
local _1 = TS.import(script, script.Parent, "internal")
local getGlobalRemote = _1.getGlobalRemote
local IS_CLIENT = _1.IS_CLIENT
local isLuaTable = _1.isLuaTable
local Players = game:GetService("Players")
local function isTargetedSubscriptionMessage(value)
	if isSubscriptionMessage(value) then
		if isLuaTable(value.Data) then
			return value.Data.InnerData ~= nil
		end
	end
	return false
end
--[[
	*
	* Similar to a ServerEvent, but works across all servers.
]]
local NetGlobalServerEvent
do
	NetGlobalServerEvent = setmetatable({}, {
		__tostring = function()
			return "NetGlobalServerEvent"
		end,
	})
	NetGlobalServerEvent.__index = NetGlobalServerEvent
	function NetGlobalServerEvent.new(...)
		local self = setmetatable({}, NetGlobalServerEvent)
		self:constructor(...)
		return self
	end
	function NetGlobalServerEvent:constructor(name)
		self.instance = NetServerEvent.new(getGlobalRemote(name))
		self.event = NetGlobalEvent.new(name)
		assert(not IS_CLIENT, "Cannot create a Net.GlobalServerEvent on the Client!")
		self.eventHandler = self.event:Connect(function(message)
			if isTargetedSubscriptionMessage(message) then
				self:recievedMessage(message.Data)
			else
				warn("[rbx-net] Recieved malformed message for GlobalServerEvent: " .. name)
			end
		end)
	end
	function NetGlobalServerEvent:getPlayersMatchingId(matching)
		local _2 = matching
		if type(_2) == "number" then
			return Players:GetPlayerByUserId(matching)
		else
			local players = {}
			for _, id in ipairs(matching) do
				local player = Players:GetPlayerByUserId(id)
				if player then
					local _3 = players
					local _4 = player
					
					_3[#_3 + 1] = _4
					
				end
			end
			return players
		end
	end
	function NetGlobalServerEvent:recievedMessage(message)
		local _2 = message.TargetId
		if message.TargetIds then
			local players = self:getPlayersMatchingId(message.TargetIds)
			if players then
				self.instance:SendToPlayers(players, unpack(message.InnerData))
			end
		elseif _2 ~= 0 and _2 == _2 and _2 then
			local player = self:getPlayersMatchingId(message.TargetId)
			if player then
				self.instance:SendToPlayer(player, unpack(message.InnerData))
			end
		else
			self.instance:SendToAllPlayers(unpack(message.InnerData))
		end
	end
	function NetGlobalServerEvent:Disconnect()
		self.eventHandler:Disconnect()
	end
	function NetGlobalServerEvent:SendToAllServers(...)
		local args = { ... }
		local _2 = self.event
		local _3 = {}
		local _4 = "data"
		local _5 = {}
		local _6 = #_5
		for _7, _8 in ipairs(args) do
			_5[_6 + _7] = _8
		end
		_3[_4] = _5
		_2:SendToAllServers(_3)
	end
	function NetGlobalServerEvent:SendToServer(jobId, ...)
		local args = { ... }
		local _2 = self.event
		local _3 = {}
		local _4 = "data"
		local _5 = {}
		local _6 = #_5
		for _7, _8 in ipairs(args) do
			_5[_6 + _7] = _8
		end
		_3[_4] = _5
		_2:SendToServer(jobId, _3)
	end
	function NetGlobalServerEvent:SendToPlayer(userId, ...)
		local args = { ... }
		local player = Players:GetPlayerByUserId(userId)
		
		if player then
			self.instance:SendToPlayer(player, unpack(args))
		else
			local _2 = self.event
			local _3 = {}
			local _4 = "data"
			local _5 = {}
			local _6 = #_5
			for _7, _8 in ipairs(args) do
				_5[_6 + _7] = _8
			end
			_3[_4] = _5
			_3.targetId = userId
			_2:SendToAllServers(_3)
		end
	end
	function NetGlobalServerEvent:SendToPlayers(userIds, ...)
		local args = { ... }
		
		for _, targetId in ipairs(userIds) do
			local player = Players:GetPlayerByUserId(targetId)
			if player then
				self.instance:SendToPlayer(player, unpack(args))
				local _2 = userIds
				local _3 = targetId
				table.remove(_2, _3 + 1)
			end
		end
		if #userIds > 0 then
			local _2 = self.event
			local _3 = {}
			local _4 = "data"
			local _5 = {}
			local _6 = #_5
			for _7, _8 in ipairs(args) do
				_5[_6 + _7] = _8
			end
			_3[_4] = _5
			_3.targetIds = userIds
			_2:SendToAllServers(_3)
		end
	end
end
return {
	default = NetGlobalServerEvent,
}
