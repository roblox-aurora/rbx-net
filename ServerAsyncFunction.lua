


local TS = require(script.Parent.vendor.RuntimeLib);
local exports = {};
local _0 = TS.import(script, script.Parent, "internal");
local findOrCreateRemote, IS_CLIENT, t_assert = _0.findOrCreateRemote, _0.IS_CLIENT, _0.t_assert;
local _1 = TS.import(script, script.Parent, "configuration");
local DebugLog, DebugWarn = _1.DebugLog, _1.DebugWarn;
local HttpService = game:GetService("HttpService");
local NetServerAsyncFunction;
do
	NetServerAsyncFunction = setmetatable({}, {
		__tostring = function() return "NetServerAsyncFunction" end;
	});
	NetServerAsyncFunction.__index = NetServerAsyncFunction;
	function NetServerAsyncFunction.new(...)
		local self = setmetatable({}, NetServerAsyncFunction);
		self:constructor(...);
		return self;
	end;
	function NetServerAsyncFunction:constructor(name, ...)
		local recievedPropTypes = { ... };
		self.timeout = 10;
		self.listeners = {};
		self.instance = findOrCreateRemote("AsyncRemoteFunction", name);
		assert(not (IS_CLIENT), "Cannot create a Net.ServerAsyncFunction on the Client!");
		if #recievedPropTypes > 0 then
			self.propTypes = recievedPropTypes;
		end;
	end;
	function NetServerAsyncFunction:GetCallTimeout()
		return self.timeout;
	end;
	function NetServerAsyncFunction:SetCallTimeout(timeout)
		assert(timeout > 0, "timeout must be a positive number");
		self.timeout = timeout;
	end;
	function NetServerAsyncFunction:SetCallback(callback)
		if self.connector then
			self.connector:Disconnect();
			self.connector = nil;
		end;
		self.connector = self.instance.OnServerEvent:Connect(TS.async(function(player, ...)
			local args = { ... };
			local eventId = args[1];
			local data = args[2];
			if (type(eventId) == "string") and (type(data) == "table") then
				if (self.propTypes == nil) or (t_assert(self.propTypes, data)) then
					local result = callback(player, unpack((data)));
					if TS.Promise.is(result) then
						result:andThen(function(promiseResult)
							self.instance:FireClient(player, eventId, promiseResult);
						end):catch(function(err)
							warn("[rbx-net] Failed to send response to client: " .. err);
						end);
					else
						self.instance:FireClient(player, eventId, result);
					end;
				else
					warn("[rbx-net] Client failed type checks");
				end;
			else
				warn("[rbx-net-async] Recieved message without eventId");
			end;
		end));
	end;
	NetServerAsyncFunction.CallPlayerAsync = TS.async(function(self, player, ...)
		local args = { ... };
		local id = HttpService:GenerateGUID(false);
		local _3 = self.instance;
		local _4 = player;
		local _2 = {};
		for _3, _4 in pairs(args) do _2[_3] = _4; end;
		_3:FireClient(_4, id, _2);
		return TS.Promise.new(function(resolve, reject)
			local connection;
			local startTime = tick();
			DebugLog("Connected CallPlayerAsync EventId", id);
			connection = self.instance.OnServerEvent:Connect(function(fromPlayer, ...)
				local recvArgs = { ... };
				local eventId = recvArgs[1];
				local data = recvArgs[2];
				if (type(eventId) == "string") and (data ~= nil) then
					if (player == player) and (eventId == id) then
						DebugLog("Disconnected CallPlayerAsync EventId", eventId);
						connection:Disconnect();
						resolve(data);
					end;
				end;
			end);
			local _5 = self.listeners;
			_5[id] = {
				connection = connection;
				timeout = self.timeout;
			};
			TS.Promise.spawn(function()
				repeat
					do
						game:GetService("RunService").Stepped:Wait();
					end;
				until not ((connection.Connected) and (tick() < startTime + self.timeout));
				self.listeners[id] = nil;
				if (tick() >= startTime) and (connection.Connected) then
					DebugWarn("(timeout) Disconnected CallPlayerAsync EventId", id);
					connection:Disconnect();
					reject("Request to client timed out");
				end;
			end);
		end);
	end);
end;
exports.default = NetServerAsyncFunction;
return exports;
