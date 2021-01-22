-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.TS.RuntimeLib)
local createLoggerMiddleware = TS.import(script, script, "LoggerMiddleware")
local createRateLimiter = TS.import(script, script, "RateLimitMiddleware").default
local createTypeChecker = TS.import(script, script, "TypeCheckMiddleware")
local NetMiddlewares = {}
do
	local _0 = NetMiddlewares
	local RateLimit = createRateLimiter
	_0.RateLimit = RateLimit
	local Logging = createLoggerMiddleware
	_0.Logging = Logging
	local TypeChecking = createTypeChecker
	_0.TypeChecking = TypeChecking
end
return {
	NetMiddlewares = NetMiddlewares,
	createRateLimiter = createRateLimiter,
	createTypeChecker = createTypeChecker,
}
