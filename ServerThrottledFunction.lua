
local TS = _G[script]
local NetServerFunction = TS.import(script, script.Parent, "ServerFunction").default
local createDeprecatedThrottledConstructor = TS.import(script, script.Parent, "utility").createDeprecatedThrottledConstructor
local NetServerThrottledFunction = createDeprecatedThrottledConstructor(function(name, rateLimit, ...)
	local recievedPropTypes = { ... }
	warn("[rbx-net] NetServerThrottledFunction is deprecated - see https://github.com/roblox-aurora/rbx-net/issues/20")
	local remote = NetServerFunction.new(name, unpack(recievedPropTypes))
	remote:SetRateLimit(rateLimit)
	return remote
end, NetServerFunction)
local default = NetServerThrottledFunction
return {
	default = default,
}
