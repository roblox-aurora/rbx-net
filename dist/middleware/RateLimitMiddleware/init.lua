-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local _0 = TS.import(script, script.Parent.Parent, "internal")
local format = _0.format
local IS_SERVER = _0.IS_SERVER
local ServerTickFunctions = _0.ServerTickFunctions
local throttler = TS.import(script, script, "throttle")
local GetConfiguration = TS.import(script, script.Parent.Parent, "configuration").GetConfiguration
local throttles = {}
local function rateLimitWarningHandler(error)
	warn("[rbx-net]", error.Message)
end
--[[
	*
	* Creates a throttle middleware for this event
	*
	* Will limit the amount of requests a player can make to this event
	*
	* _NOTE: Must be used before **other** middlewares as it's not a type altering middleware_
	* @param maxRequestsPerMinute The maximum requests per minute
]]
local function createRateLimiter(options)
	local maxRequestsPerMinute = options.MaxRequestsPerMinute
	local _1 = options.ErrorHandler
	if _1 == nil then
		_1 = rateLimitWarningHandler
	end
	local errorHandler = _1
	return function(next, event)
		local instance = event:GetInstance()
		local _2 = throttles
		local _3 = event
		local throttle = _2[_3]
		if throttle == nil then
			throttle = throttler:Get(instance:GetFullName())
		end
		return function(player, ...)
			local args = { ... }
			local count = throttle:Get(player)
			if count >= maxRequestsPerMinute then
				local _4 = errorHandler
				if _4 ~= nil then
					_4({
						Message = format(GetConfiguration("ServerThrottleMessage"), {
							player = player.UserId,
							remote = instance.Name,
							limit = maxRequestsPerMinute,
						}),
						MaxRequestsPerMinute = maxRequestsPerMinute,
						RemoteId = instance.Name,
						UserId = player.UserId,
					})
				end
			else
				throttle:Increment(player)
				return next(player, unpack(args))
			end
		end
	end
end
if IS_SERVER then
	local lastTick = 0
	local _1 = ServerTickFunctions
	local _2 = function()
		if tick() > lastTick + GetConfiguration("ServerThrottleResetTimer") then
			lastTick = tick()
			throttler:Clear()
		end
	end
	-- ▼ Array.push ▼
	_1[#_1 + 1] = _2
	-- ▲ Array.push ▲
end
local default = createRateLimiter
return {
	rateLimitWarningHandler = rateLimitWarningHandler,
	default = default,
}
