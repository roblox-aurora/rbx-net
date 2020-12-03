
local TS = _G[script]
local NetServerEvent = TS.import(script, script.Parent, "ServerEvent").default
local createDeprecatedThrottledConstructor = TS.import(script, script.Parent, "utility").createDeprecatedThrottledConstructor











local NetServerThrottledEvent = createDeprecatedThrottledConstructor(function(name, rateLimit, ...)
	local recievedPropTypes = { ... }
	warn("[rbx-net] NetServerThrottledEvent is deprecated - see https://github.com/roblox-aurora/rbx-net/issues/20")
	local remote = NetServerEvent.new(name, unpack(recievedPropTypes))
	remote:SetRateLimit(rateLimit)
	return remote
end, NetServerEvent)
local default = NetServerThrottledEvent
return {
	default = default,
}
