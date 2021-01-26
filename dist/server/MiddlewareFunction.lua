-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local MiddlewareFunction
do
	MiddlewareFunction = {}
	function MiddlewareFunction:constructor(middlewares)
		if middlewares == nil then
			middlewares = {}
		end
		self.middlewares = middlewares
	end
	function MiddlewareFunction:_processMiddleware(callback)
		local _0 = self
		local middlewares = _0.middlewares
		local _1, _2 = TS.try(function()
			if #middlewares > 0 then
				local callbackFn = callback
				-- Run through each middleware
				for _, middleware in ipairs(middlewares) do
					callbackFn = middleware(callbackFn, self)
				end
				return TS.TRY_RETURN, { callbackFn }
			else
				return TS.TRY_RETURN, { callback }
			end
		end, function(e)
			warn("[rbx-net] " .. tostring(e))
		end)
		if _1 then
			return unpack(_2)
		end
	end
end
local default = MiddlewareFunction
return {
	default = default,
}
