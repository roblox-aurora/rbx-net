-- Compiled with https://roblox-ts.github.io v0.2.15-commit-fd67c49.0
-- October 31, 2019, 1:41 AM Coordinated Universal Time

local TS = require(script.Parent.vendor.RuntimeLib);
local exports = {};
local _0 = TS.import(script, script.Parent, "internal");
local IS_SERVER, getRemoteOrThrow = _0.IS_SERVER, _0.getRemoteOrThrow;
local _1 = TS.import(script, script.Parent, "configuration");
local DebugLog, DebugWarn = _1.DebugLog, _1.DebugWarn;
local HttpService = game:GetService("HttpService");
local NetClientAsyncFunction;
do
	NetClientAsyncFunction = setmetatable({}, {
		__tostring = function() return "NetClientAsyncFunction" end;
	});
	NetClientAsyncFunction.__index = NetClientAsyncFunction;
	function NetClientAsyncFunction.new(...)
		local self = setmetatable({}, NetClientAsyncFunction);
		self:constructor(...);
		return self;
	end;
	function NetClientAsyncFunction:constructor(name)
		self.timeout = 10;
		self.listeners = {};
		self.instance = getRemoteOrThrow("AsyncRemoteFunction", name);
		assert(not (IS_SERVER), "Cannot create a Net.ClientAsyncFunction on the Server!");
	end;
	function NetClientAsyncFunction:SetCallTimeout(timeout)
		assert(timeout > 0, "timeout must be a positive number");
		self.timeout = timeout;
	end;
	function NetClientAsyncFunction:GetCallTimeout()
		return self.timeout;
	end;
	function NetClientAsyncFunction:SetCallback(callback)
		if self.connector then
			self.connector:Disconnect();
			self.connector = nil;
		end;
		self.connector = self.instance.OnClientEvent:Connect(TS.async(function(...)
			local args = { ... };
			local eventId = args[1];
			local data = args[2];
			if (type(eventId) == "string") and (type(data) == "table") then
				local result = callback(unpack(data));
				if TS.Promise.is(result) then
					result:andThen(function(promiseResult)
						self.instance:FireServer(eventId, promiseResult);
					end):catch(function(err)
						warn("[rbx-net] Failed to send response to server: " .. err);
					end);
				else
					self.instance:FireServer(eventId, result);
				end;
			else
				warn("Recieved message without eventId");
			end;
		end));
	end;
	NetClientAsyncFunction.CallServerAsync = TS.async(function(self, ...)
		local args = { ... };
		local id = HttpService:GenerateGUID(false);
		local _3 = self.instance;
		local _2 = {};
		for _3, _4 in pairs(args) do _2[_3] = _4; end;
		_3:FireServer(id, _2);
		return TS.Promise.new(function(resolve, reject)
			local connection;
			local startTime = tick();
			DebugLog("Connected CallServerAsync EventId", id);
			connection = self.instance.OnClientEvent:Connect(function(...)
				local recvArgs = { ... };
				local eventId = recvArgs[1];
				local data = recvArgs[2];
				if (type(eventId) == "string") and (data ~= nil) then
					if eventId == id then
						DebugLog("Disconnected CallServerAsync EventId", eventId);
						connection:Disconnect();
						resolve(data);
					end;
				end;
			end);
			local _4 = self.listeners;
			_4[id] = {
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
					DebugWarn("(timeout) Disconnected CallServerAsync EventId", id);
					connection:Disconnect();
					reject("Request to client timed out");
				end;
			end);
		end);
	end);
end;
exports.default = NetClientAsyncFunction;
return exports;
