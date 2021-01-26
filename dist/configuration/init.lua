-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.TS.RuntimeLib)
local IS_CLIENT = TS.import(script, script.Parent, "internal").IS_CLIENT
local runService = game:GetService("RunService")
local IS_SERVER = runService:IsServer()
local throttleResetTimer = 60
local rateLimitReachedMessage = "Request limit exceeded ({limit}) by {player} via {remote}"
local NetConfig = {}
do
	local _0 = NetConfig
	-- * @internal
	_0.DebugEnabled = "production" == "development"
	-- * @rbxts client
	local function SetClientConfiguration(key, value)
		local _1 = IS_CLIENT
		assert(_1, "Use SetConfiguration on the server!")
		if key == "EnableDebugMessages" then
			_0.DebugEnabled = value
		end
	end
	_0.SetClientConfiguration = SetClientConfiguration
	-- * @rbxts server
	local function SetConfiguration(key, value)
		local _1 = IS_SERVER
		assert(_1, "Cannot set configuration on client!")
		if key == "ServerThrottleResetTimer" then
			throttleResetTimer = value
		elseif key == "ServerThrottleMessage" then
			rateLimitReachedMessage = value
		elseif key == "EnableDebugMessages" then
			_0.DebugEnabled = value
		end
	end
	_0.SetConfiguration = SetConfiguration
	local function GetConfiguration(key)
		if key == "ServerThrottleResetTimer" then
			local _1 = IS_SERVER
			assert(_1, "ServerThrottleResetTimer is not used on the client!")
			return throttleResetTimer
		elseif key == "ServerThrottleMessage" then
			local _1 = IS_SERVER
			assert(_1, "ServerThrottleMessage is not used on the client!")
			return rateLimitReachedMessage
		elseif key == "EnableDebugMessages" then
			return _0.DebugEnabled
		else
			return nil
		end
	end
	_0.GetConfiguration = GetConfiguration
	-- * @internal
	local function DebugWarn(...)
		local message = { ... }
		if _0.DebugEnabled then
			warn("[rbx-net-debug]", unpack(message))
		end
	end
	_0.DebugWarn = DebugWarn
	-- * @internal
	local function DebugLog(...)
		local message = { ... }
		if _0.DebugEnabled then
			print("[rbx-net-debug]", unpack(message))
		end
	end
	_0.DebugLog = DebugLog
end
return NetConfig
