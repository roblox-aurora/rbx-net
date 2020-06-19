


local TS = require(script.Parent.vendor.RuntimeLib);
local exports;
local NetConfig;
local IS_CLIENT = TS.import(script, script.Parent, "internal").IS_CLIENT;
local runService = game:GetService("RunService");
local IS_SERVER = runService:IsServer();
local throttleResetTimer = 60;
local rateLimitReachedMessage = "Request limit exceeded ({limit}) by {player} via {remote}";
NetConfig = NetConfig or {} do
	local _0 = NetConfig;
	_0.DebugEnabled = false;
	local function SetClientConfiguration(key, value)
		assert(IS_CLIENT, "Use SetConfiguration on the server!");
		if key == "EnableDebugMessages" then
			_0.DebugEnabled = value;
		end;
	end;
	local function SetConfiguration(key, value)
		assert(IS_SERVER, "Cannot set configuration on client!");
		if key == "ServerThrottleResetTimer" then
			throttleResetTimer = value;
		elseif key == "ServerThrottleMessage" then
			rateLimitReachedMessage = value;
		elseif key == "EnableDebugMessages" then
			_0.DebugEnabled = value;
		elseif key == "InvalidPropTypesHandler" then
			_0.InvalidPropTypesHandlerFunc = value;
		end;
	end;
	local function GetConfiguration(key)
		if key == "ServerThrottleResetTimer" then
			assert(IS_SERVER, "ServerThrottleResetTimer is not used on the client!");
			return throttleResetTimer;
		elseif key == "ServerThrottleMessage" then
			assert(IS_SERVER, "ServerThrottleMessage is not used on the client!");
			return rateLimitReachedMessage;
		elseif key == "EnableDebugMessages" then
			return _0.DebugEnabled;
		else
			return nil;
		end;
	end;
	local function DebugWarn(...)
		local message = { ... };
		if _0.DebugEnabled then
			warn("[rbx-net-debug]", unpack(message));
		end;
	end;
	local function DebugLog(...)
		local message = { ... };
		if _0.DebugEnabled then
			print("[rbx-net-debug]", unpack(message));
		end;
	end;
	_0.SetClientConfiguration = SetClientConfiguration;
	_0.SetConfiguration = SetConfiguration;
	_0.GetConfiguration = GetConfiguration;
	_0.DebugWarn = DebugWarn;
	_0.DebugLog = DebugLog;
end;
exports = NetConfig;
return exports;
