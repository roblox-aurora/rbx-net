


local TS = require(script.Parent.vendor.RuntimeLib);
local exports = {};
local NetServerEvent;
local _0 = TS.import(script, script.Parent, "internal");
local findOrCreateRemote, IS_CLIENT, checkArguments, errorft = _0.findOrCreateRemote, _0.IS_CLIENT, _0.checkArguments, _0.errorft;
local throttler = TS.import(script, script.Parent, "Throttle");
local GetConfiguration = TS.import(script, script.Parent, "configuration").GetConfiguration;
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
		self.maxRequestsPerMinute = 0;
		self.instance = findOrCreateRemote("RemoteEvent", name);
		assert(not (IS_CLIENT), "Cannot create a Net.ServerEvent on the Client!");
		self.clientRequests = throttler:Get("Event~" .. name);
		if #recievedPropTypes > 0 then
			self.propTypes = recievedPropTypes;
		end;
	end;
	
	function NetServerEvent:Unmanaged(name)
		return findOrCreateRemote("RemoteEvent", name);
	end;
	function NetServerEvent:Group(list)
		local map = {};
		for key, value in pairs(list) do
			if type(value) == "table" then
				local item = NetServerEvent.new(key, unpack((value)));
				map[key] = item;
			elseif type(value) == "boolean" then
				map[key] = NetServerEvent.new(key);
			elseif type(value) == "function" then
				local event = NetServerEvent.new(key);
				event:Connect(value);
			end;
		end;
		return map;
	end;
	function NetServerEvent:PureReciever(name, cb, ...)
		local recievedPropTypes = { ... };
		local event = NetServerEvent.new(name, unpack(recievedPropTypes));
		event:Connect(cb);
		return event;
	end;
	function NetServerEvent:PureSender(name, ...)
		local recievedPropTypes = { ... };
		local event = NetServerEvent.new(name, unpack(recievedPropTypes));
		return event;
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
				local maxRequests = self.maxRequestsPerMinute;
				if maxRequests > 0 then
					local clientRequestCount = self.clientRequests:Get(sourcePlayer);
					if clientRequestCount >= maxRequests then
						errorft(GetConfiguration("ServerThrottleMessage"), {
							player = sourcePlayer.UserId;
							remote = self.instance.Name;
							limit = maxRequests;
						});
					else
						self.clientRequests:Increment(sourcePlayer);
					end;
				end;
				if checkArguments(self.propTypes, args) then
					callback(sourcePlayer, unpack((args)));
				end;
			end);
		else
			return self:GetEvent():Connect(callback);
		end;
	end;
	function NetServerEvent:SendToAllPlayers(...)
		local args = { ... };
		if self.callTypes ~= nil then
			if not (checkArguments(self.callTypes, args)) then
				return nil;
			end;
		end;
		self.instance:FireAllClients(unpack((args)));
	end;
	function NetServerEvent:SendToAllPlayersExcept(blacklist, ...)
		local args = { ... };
		if self.callTypes ~= nil then
			if not (checkArguments(self.callTypes, args)) then
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
				if (table.find(blacklist, player) or 0) - 1 == -1 then
					self.instance:FireClient(player, unpack((args)));
				end;
			end;
		end;
	end;
	function NetServerEvent:SendToPlayer(player, ...)
		local args = { ... };
		if self.callTypes ~= nil then
			if not (checkArguments(self.callTypes, args)) then
				return nil;
			end;
		end;
		self.instance:FireClient(player, unpack((args)));
	end;
	function NetServerEvent:SendToPlayers(players, ...)
		local args = { ... };
		if self.callTypes ~= nil then
			if not (checkArguments(self.callTypes, args)) then
				return nil;
			end;
		end;
		for _1 = 1, #players do
			local player = players[_1];
			self:SendToPlayer(player, unpack((args)));
		end;
	end;
	function NetServerEvent:SetRateLimit(requestsPerMinute)
		self.maxRequestsPerMinute = requestsPerMinute;
		local clientValue = self.instance:FindFirstChild("RateLimit");
		if clientValue then
			clientValue.Value = requestsPerMinute;
		else
			clientValue = Instance.new("IntValue", self.instance);
			clientValue.Name = "RateLimit";
			clientValue.Value = requestsPerMinute;
		end;
	end;
	function NetServerEvent:GetRateLimit()
		return self.maxRequestsPerMinute;
	end;
end;
exports.default = NetServerEvent;
return exports;
