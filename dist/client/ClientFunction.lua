-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local _0 = TS.import(script, script.Parent.Parent, "internal")
local getRemoteOrThrow = _0.getRemoteOrThrow
local IS_SERVER = _0.IS_SERVER
local waitForRemote = _0.waitForRemote
local ClientFunction
do
	ClientFunction = setmetatable({}, {
		__tostring = function()
			return "ClientFunction"
		end,
	})
	ClientFunction.__index = ClientFunction
	function ClientFunction.new(...)
		local self = setmetatable({}, ClientFunction)
		self:constructor(...)
		return self
	end
	function ClientFunction:constructor(name)
		self.instance = getRemoteOrThrow("RemoteFunction", name)
		local _1 = not IS_SERVER
		assert(_1, "Cannot create a Net.ClientFunction on the Server!")
	end
	function ClientFunction:Wait(name)
		return TS.Promise.defer(TS.async(function(resolve)
			TS.await(waitForRemote("RemoteFunction", name, 10))
			resolve(ClientFunction.new(name))
		end))
	end
	ClientFunction.CallServerAsync = TS.async(function(self, ...)
		local args = { ... }
		return TS.Promise.defer(function(resolve)
			local result = self.instance:InvokeServer(unpack(args))
			resolve(result)
		end)
	end)
end
return {
	default = ClientFunction,
}
