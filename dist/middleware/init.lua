-- Compiled with roblox-ts v1.1.1
local TS = require(script.Parent.TS.RuntimeLib)
local createLoggerMiddleware = TS.import(script, script, "LoggerMiddleware")
local createRateLimiter = TS.import(script, script, "RateLimitMiddleware").default
local NetTypeCheckingMiddleware = TS.import(script, script, "TypeCheckMiddleware")
local NetMiddleware = {}
do
	local _0 = NetMiddleware
	local RateLimit = createRateLimiter
	_0.RateLimit = RateLimit
	local Logging = createLoggerMiddleware
	_0.Logging = Logging
	-- * The type checking middleware
	local TypeChecking = NetTypeCheckingMiddleware
	_0.TypeChecking = TypeChecking
	--[[
		*
		* Creates a global read-only middleware for use in `Net.Definitions` global middleware.
	]]
	local function Global(middleware)
		local _1 = function(processNext, event)
			return function(sender, ...)
				local args = { ... }
				middleware(event:GetInstance().Name, args, sender)
				return processNext(sender, unpack(args))
			end
		end
		return _1
	end
	_0.Global = Global
end
local createTypeChecker = NetTypeCheckingMiddleware
return {
	NetMiddleware = NetMiddleware,
	createRateLimiter = createRateLimiter,
	createTypeChecker = createTypeChecker,
}
