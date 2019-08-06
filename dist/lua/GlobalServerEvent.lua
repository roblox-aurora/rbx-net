-- Compiled with https://roblox-ts.github.io v0.2.14
-- August 6, 2019, 5:15 PM New Zealand Standard Time

local TS = require(script.Parent.vendor.RuntimeLib);
local exports = {};
local NetServerEvent = TS.import(script.Parent, "ServerEvent").default;
local _0 = TS.import(script.Parent, "GlobalEvent");
local NetGlobalEvent, isSubscriptionMessage, ISubscriptionMessage = _0.default, _0.isSubscriptionMessage, _0.ISubscriptionMessage;
local _1 = TS.import(script.Parent, "internal");
local getGlobalRemote, IS_CLIENT, isLuaTable = _1.getGlobalRemote, _1.IS_CLIENT, _1.isLuaTable;
local Players = game:GetService("Players");
local function isTargetedSubscriptionMessage(value)
	if isSubscriptionMessage(value) then
		if isLuaTable(value.Data) then
			return (value.Data["InnerData"] ~= nil);
		end;
	end;
	return false;
end;
local NetGlobalServerEvent;
do
	NetGlobalServerEvent = setmetatable({}, {
		__tostring = function() return "NetGlobalServerEvent" end;
	});
	NetGlobalServerEvent.__index = NetGlobalServerEvent;
	function NetGlobalServerEvent.new(...)
		local self = setmetatable({}, NetGlobalServerEvent);
		self:constructor(...);
		return self;
	end;
	function NetGlobalServerEvent:constructor(name)
		self.instance = NetServerEvent.new(getGlobalRemote(name));
		self.event = NetGlobalEvent.new(name);
		assert(not IS_CLIENT, "Cannot create a Net.GlobalServerEvent on the Client!");
		self.eventHandler = self.event:Connect(function(message)
			if isTargetedSubscriptionMessage(message) then
				self:recievedMessage(message.Data);
			else
				warn("[rbx-net] Recieved malformed message for GlobalServerEvent: " .. name);
			end;
		end);
	end;
	function NetGlobalServerEvent:getPlayersMatchingId(matching)
		if (typeof(matching) == "number") then
			return Players:GetPlayerByUserId(matching);
		else
			local players = {};
			for _2 = 1, #matching do
				local id = matching[_2];
				local player = Players:GetPlayerByUserId(id);
				if player then
					players[#players + 1] = player;
				end;
			end;
			return players;
		end;
	end;
	function NetGlobalServerEvent:recievedMessage(message)
		if message.TargetIds then
			local players = self:getPlayersMatchingId(message.TargetIds);
			if players then
				self.instance:SendToPlayers(players, unpack(message.InnerData));
			end;
		elseif message.TargetId then
			local player = self:getPlayersMatchingId(message.TargetId);
			if player then
				self.instance:SendToPlayer(player, unpack(message.InnerData));
			end;
		else
			self.instance:SendToAllPlayers(unpack(message.InnerData));
		end;
	end;
	function NetGlobalServerEvent:Disconnect()
		self.eventHandler:Disconnect();
	end;
	function NetGlobalServerEvent:SendToAllServers(...)
		local args = { ... };
		self.event:SendToAllServers({
			data = { unpack(args) };
		});
	end;
	function NetGlobalServerEvent:SendToServer(jobId, ...)
		local args = { ... };
		self.event:SendToServer(jobId, {
			data = { unpack(args) };
		});
	end;
	function NetGlobalServerEvent:SendToPlayer(userId, ...)
		local args = { ... };
		local player = Players:GetPlayerByUserId(userId);
		if player then
			self.instance:SendToPlayer(player, unpack(args));
		else
			self.event:SendToAllServers({
				data = { unpack(args) };
				targetId = userId;
			});
		end;
	end;
	function NetGlobalServerEvent:SendToPlayers(userIds, ...)
		local args = { ... };
		for _2 = 1, #userIds do
			local targetId = userIds[_2];
			local player = Players:GetPlayerByUserId(targetId);
			if player then
				self.instance:SendToPlayer(player, unpack(args));
				table.remove(userIds, targetId + 1);
			end;
		end;
		if #userIds > 0 then
			self.event:SendToAllServers({
				data = { unpack(args) };
				targetIds = userIds;
			});
		end;
	end;
end;
exports.default = NetGlobalServerEvent;
return exports;
