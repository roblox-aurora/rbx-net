-- Compiled with https://roblox-ts.github.io v0.2.14
-- August 6, 2019, 7:32 PM New Zealand Standard Time

local TS = require(script.Parent.vendor.RuntimeLib);
local exports = {};
local _0 = TS.import(script.Parent, "internal");
local findOrCreateRemote, IS_CLIENT = _0.findOrCreateRemote, _0.IS_CLIENT;
local Players = game:GetService("Players");
local NetServerEvent;
do
	NetServerEvent = setmetatable({}, {
		__tostring = function() return "NetServerEvent" end;
	});
	NetServerEvent.__index = NetServerEvent;
	function NetServerEvent.new(...)
		local self = setmetatable({}, NetServerEvent);
		self:constructor(...);
		return self;
	end;
	function NetServerEvent:constructor(name)
		self.instance = findOrCreateRemote("RemoteEvent", name);
		assert(not IS_CLIENT, "Cannot create a Net.ServerEvent on the Client!");
	end;
	function NetServerEvent:getInstance()
		return self.instance;
	end;
	function NetServerEvent:getEvent()
		return self.instance.OnServerEvent;
	end;
	function NetServerEvent:Connect(callback)
		return self:getEvent():Connect(callback);
	end;
	function NetServerEvent:SendToAllPlayers(...)
		local args = { ... };
		self.instance:FireAllClients(unpack(args));
	end;
	function NetServerEvent:SendToAllPlayersExcept(blacklist, ...)
		local args = { ... };
		if (typeof(blacklist) == "Instance") then
			local otherPlayers = TS.array_filter(Players:GetPlayers(), function(p)
				return p ~= blacklist;
			end);
			for _1 = 1, #otherPlayers do
				local player = otherPlayers[_1];
				self.instance:FireClient(player, unpack(args));
			end;
		elseif (typeof(blacklist) == "table") then
			local _1 = Players:GetPlayers();
			for _2 = 1, #_1 do
				local player = _1[_2];
				if TS.array_indexOf(blacklist, player) == -1 then
					self.instance:FireClient(player, unpack(args));
				end;
			end;
		end;
	end;
	function NetServerEvent:SendToPlayer(player, ...)
		local args = { ... };
		self.instance:FireClient(player, unpack(args));
	end;
	function NetServerEvent:SendToPlayers(players, ...)
		local args = { ... };
		for _1 = 1, #players do
			local player = players[_1];
			self:SendToPlayer(player, unpack(args));
		end;
	end;
end;
exports.default = NetServerEvent;
return exports;
