-- Compiled with roblox-ts v1.1.1
local TS = require(script.Parent.TS.RuntimeLib)
local IS_CLIENT = TS.import(script, script.Parent, "internal").IS_CLIENT
local runService = game:GetService("RunService")
local IS_SERVER = runService:IsServer()
local Configuration = {
	ServerThrottleResetTimer = 60,
	EnableDebugMessages = "production" == "development",
	ServerThrottleMessage = "Request limit exceeded ({limit}) by {player} via {remote}",
}
local NetConfig = {}
do
	local _0 = NetConfig
	-- * @internal
	local DebugEnabled = "production" == "development"
	_0.DebugEnabled = DebugEnabled
	local function SetClient(config)
		local _1 = IS_CLIENT
		assert(_1, "Use SetClient on the client!")
		local _2 = {}
		for _3, _4 in pairs(Configuration) do
			_2[_3] = _4
		end
		for _3, _4 in pairs(config) do
			_2[_3] = _4
		end
		Configuration = _2
	end
	_0.SetClient = SetClient
	local function Set(config)
		local _1 = IS_SERVER
		assert(_1, "Use Set on the server!")
		local _2 = {}
		for _3, _4 in pairs(Configuration) do
			_2[_3] = _4
		end
		for _3, _4 in pairs(config) do
			_2[_3] = _4
		end
		Configuration = _2
	end
	_0.Set = Set
	local function Get()
		return Configuration
	end
	_0.Get = Get
	--[[
		*
		* @deprecated
		* @rbxts client
	]]
	local function SetClientConfiguration(key, value)
		local _1 = IS_CLIENT
		assert(_1, "Use SetConfiguration on the server!")
		if key == "EnableDebugMessages" then
			Configuration.EnableDebugMessages = value
		end
	end
	_0.SetClientConfiguration = SetClientConfiguration
	--[[
		*
		* @rbxts server
		* @deprecated
		*
	]]
	local function SetConfiguration(key, value)
		local _1 = IS_SERVER
		assert(_1, "Cannot set configuration on client!")
		Configuration[key] = value
	end
	_0.SetConfiguration = SetConfiguration
	--[[
		*
		* @deprecated
	]]
	local function GetConfiguration(key)
		return Configuration[key]
	end
	_0.GetConfiguration = GetConfiguration
	-- * @internal
	local function DebugWarn(...)
		local message = { ... }
		if DebugEnabled then
			warn("[rbx-net-debug]", unpack(message))
		end
	end
	_0.DebugWarn = DebugWarn
	-- * @internal
	local function DebugLog(...)
		local message = { ... }
		if DebugEnabled then
			print("[rbx-net-debug]", unpack(message))
		end
	end
	_0.DebugLog = DebugLog
end
return NetConfig
