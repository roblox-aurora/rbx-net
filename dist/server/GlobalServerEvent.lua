-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local _0 = TS.import(script, script.Parent, "GlobalEvent")
local NetGlobalEvent = _0.default
local isSubscriptionMessage = _0.isSubscriptionMessage
local _1 = TS.import(script, script.Parent.Parent, "internal")
local getGlobalRemote = _1.getGlobalRemote
local IS_CLIENT = _1.IS_CLIENT
local isLuaTable = _1.isLuaTable
local ServerEvent = TS.import(script, script.Parent, "ServerEvent").default
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
local CrossServerEvent
do
	CrossServerEvent = setmetatable({}, {
		__tostring = function()
			return "CrossServerEvent"
		end,
	})
	CrossServerEvent.__index = CrossServerEvent
	function CrossServerEvent.new(...)
		local self = setmetatable({}, CrossServerEvent)
		self:constructor(...)
		return self
	end
	function CrossServerEvent:constructor(name)
		self.instance = ServerEvent.new(getGlobalRemote(name))
		self.event = NetGlobalEvent.new(name)
		local _2 = not IS_CLIENT
		assert(_2, "Cannot create a Net.GlobalServerEvent on the Client!")
		self.eventHandler = self.event:Connect(function(message)
			if isTargetedSubscriptionMessage(message) then
				self:recievedMessage(message.Data)
			else
				warn("[rbx-net] Recieved malformed message for GlobalServerEvent: " .. name)
			end
		end)
	end
	function CrossServerEvent:getPlayersMatchingId(matching)
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
					-- ▼ Array.push ▼
					_3[#_3 + 1] = _4
					-- ▲ Array.push ▲
				end
			end
			return players
		end
	end
	function CrossServerEvent:recievedMessage(message)
		if message.TargetIds then
			local players = self:getPlayersMatchingId(message.TargetIds)
			if players then
				self.instance:SendToPlayers(players, unpack(message.InnerData))
			end
		elseif message.TargetId ~= nil then
			local player = self:getPlayersMatchingId(message.TargetId)
			if player then
				self.instance:SendToPlayer(player, unpack(message.InnerData))
			end
		else
			self.instance:SendToAllPlayers(unpack(message.InnerData))
		end
	end
	function CrossServerEvent:Disconnect()
		self.eventHandler:Disconnect()
	end
	function CrossServerEvent:SendToAllServers(...)
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
	function CrossServerEvent:SendToServer(jobId, ...)
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
	function CrossServerEvent:SendToPlayer(userId, ...)
		local args = { ... }
		local player = Players:GetPlayerByUserId(userId)
		-- If the player exists in this instance, just send it straight to them.
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
	function CrossServerEvent:SendToPlayers(userIds, ...)
		local args = { ... }
		-- Check to see if any of these users are in this server first, and handle accordingly.
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
	default = CrossServerEvent,
}
