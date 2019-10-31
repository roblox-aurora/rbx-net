-- Compiled with https://roblox-ts.github.io v0.2.15-commit-fd67c49.0
-- October 31, 2019, 1:52 AM Coordinated Universal Time

local TS = require(script.Parent.vendor.RuntimeLib);
local exports = {};
local NetServerEvent;
local _0 = TS.import(script, script.Parent, "internal");
local findOrCreateRemote, IS_CLIENT, t_assert = _0.findOrCreateRemote, _0.IS_CLIENT, _0.t_assert;
local Players = game:GetService("Players");
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
	function NetServerEvent:constructor(name, ...)
		local recievedPropTypes = { ... };
		self.instance = findOrCreateRemote("RemoteEvent", name);
		assert(not (IS_CLIENT), "Cannot create a Net.ServerEvent on the Client!");
		if #recievedPropTypes > 0 then
			self.propTypes = recievedPropTypes;
		end;
	end;
	function NetServerEvent:WithStrictCall(...)
		local callPropTypes = { ... };
		self.callTypes = callPropTypes;
		return self;
	end;
	function NetServerEvent:GetInstance()
		return self.instance;
	end;
	function NetServerEvent:GetEvent()
		return self.instance.OnServerEvent;
	end;
	function NetServerEvent:Connect(callback)
		if self.propTypes ~= nil then
			return self:GetEvent():Connect(function(sourcePlayer, ...)
				local args = { ... };
				if t_assert(self.propTypes, args) then
					callback(sourcePlayer, unpack(args));
				end;
			end);
		else
			return self:GetEvent():Connect(callback);
		end;
	end;
	function NetServerEvent:SendToAllPlayers(...)
		local args = { ... };
		if self.callTypes ~= nil then
			if not (t_assert(self.callTypes, args)) then
				return nil;
			end;
		end;
		self.instance:FireAllClients(unpack((args)));
	end;
	function NetServerEvent:SendToAllPlayersExcept(blacklist, ...)
		local args = { ... };
		if self.callTypes ~= nil then
			if not (t_assert(self.callTypes, args)) then
				return nil;
			end;
		end;
		if typeof(blacklist) == "Instance" then
			local otherPlayers = TS.array_filter(Players:GetPlayers(), function(p)
				return p ~= blacklist;
			end);
			for _1 = 1, #otherPlayers do
				local player = otherPlayers[_1];
				self.instance:FireClient(player, unpack((args)));
			end;
		elseif type(blacklist) == "table" then
			local _1 = Players:GetPlayers();
			for _2 = 1, #_1 do
				local player = _1[_2];
				if TS.array_indexOf(blacklist, player) == -1 then
					self.instance:FireClient(player, unpack((args)));
				end;
			end;
		end;
	end;
	function NetServerEvent:SendToPlayer(player, ...)
		local args = { ... };
		if self.callTypes ~= nil then
			if not (t_assert(self.callTypes, args)) then
				return nil;
			end;
		end;
		self.instance:FireClient(player, unpack((args)));
	end;
	function NetServerEvent:SendToPlayers(players, ...)
		local args = { ... };
		if self.callTypes ~= nil then
			if not (t_assert(self.callTypes, args)) then
				return nil;
			end;
		end;
		for _1 = 1, #players do
			local player = players[_1];
			self:SendToPlayer(player, unpack((args)));
		end;
	end;
end;
exports.default = NetServerEvent;
return exports;
