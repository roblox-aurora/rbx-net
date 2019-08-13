-- Compiled with https://roblox-ts.github.io v0.2.14
-- August 13, 2019, 4:24 PM New Zealand Standard Time

local exports;
local NetConfig;
local runService = game:GetService("RunService");
local IS_SERVER = runService:IsServer();
local throttleResetTimer = 60;
local rateLimitReachedMessage = "Request limit exceeded ({limit}) by {player} via {remote}";
NetConfig = NetConfig or {} do
	local _0 = NetConfig;
	local function SetConfiguration(key, value)
		assert(IS_SERVER, "Cannot modify configuration on client!");
		if key == "ServerThrottleMessage" then
			throttleResetTimer = value;
		elseif key == "ServerThrottleMessage" then
			rateLimitReachedMessage = value;
		end;
	end;
	local function GetConfiguration(key)
		if key == "ServerThrottleResetTimer" then
			assert(IS_SERVER, "ServerThrottleResetTimer is not used on the client!");
			return throttleResetTimer;
		elseif key == "ServerThrottleMessage" then
			assert(IS_SERVER, "ServerThrottleMessage is not used on the client!");
			return rateLimitReachedMessage;
		else
			return nil;
		end;
	end;
	_0.SetConfiguration = SetConfiguration;
	_0.GetConfiguration = GetConfiguration;
end;
exports = NetConfig;
return exports;
