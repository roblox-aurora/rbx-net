-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local _0 = TS.import(script, script.Parent.Parent, "internal")
local findOrCreateRemote = _0.findOrCreateRemote
local IS_SERVER = _0.IS_SERVER
local MiddlewareFunction = TS.import(script, script.Parent, "MiddlewareFunction").default
local ServerFunction
do
	local super = MiddlewareFunction
	ServerFunction = setmetatable({}, {
		__tostring = function()
			return "ServerFunction"
		end,
		__index = super,
	})
	ServerFunction.__index = ServerFunction
	function ServerFunction.new(...)
		local self = setmetatable({}, ServerFunction)
		self:constructor(...)
		return self
	end
	function ServerFunction:constructor(name, middlewares)
		if middlewares == nil then
			middlewares = {}
		end
		super.constructor(self, middlewares)
		self.instance = findOrCreateRemote("RemoteFunction", name)
		local _1 = IS_SERVER
		assert(_1, "Cannot create a Net.ServerFunction on the Client!")
	end
	function ServerFunction:GetInstance()
		return self.instance
	end
	function ServerFunction:SetCallback(callback)
		self.instance.OnServerInvoke = function(player, ...)
			local args = { ... }
			local _1 = self:_processMiddleware(callback)
			if _1 ~= nil then
				_1 = _1(player, unpack(args))
			end
			local result = _1
			if TS.Promise.is(result) then
				warn("[rbx-net] WARNING: Promises should be used with an AsyncFunction!")
				local success, value = result:await()
				if success then
					return value
				else
					error(value)
				end
			end
			return result
		end
	end
end
return {
	default = ServerFunction,
}
