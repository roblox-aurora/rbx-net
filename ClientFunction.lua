
local TS = _G[script]
local _0 = TS.import(script, script.Parent, "internal")
local getRemoteOrThrow = _0.getRemoteOrThrow
local IS_CLIENT = _0.IS_CLIENT
local functionExists = _0.functionExists
local waitForFunction = _0.waitForFunction
local MAX_CLIENT_WAITFORCHILD_TIMEOUT = _0.MAX_CLIENT_WAITFORCHILD_TIMEOUT
--[[
	*
	* A function on the client
	* @rbxts client
]]
local NetClientFunction
do
	NetClientFunction = setmetatable({}, {
		__tostring = function()
			return "NetClientFunction"
		end,
	})
	NetClientFunction.__index = NetClientFunction
	function NetClientFunction.new(...)
		local self = setmetatable({}, NetClientFunction)
		self:constructor(...)
		return self
	end
	function NetClientFunction:constructor(name)
		self.lastPing = -1
		self.cached = {}
		self.instance = getRemoteOrThrow("RemoteFunction", name)
		assert(IS_CLIENT, "Cannot create a Net.ClientFunction on the Server!")
		assert(functionExists(name), "The specified function '" .. name .. "' does not exist!")
	end
	NetClientFunction.WaitFor = TS.async(function(self, name)
		local fun = waitForFunction(name, MAX_CLIENT_WAITFORCHILD_TIMEOUT)
		if not fun then
			error("Failed to retrieve client Function!")
		end
		return NetClientFunction.new(name)
	end)
	function NetClientFunction:Unmanaged(name)
		return getRemoteOrThrow("RemoteFunction", name)
	end
	function NetClientFunction:GetInstance()
		return self.instance
	end
	function NetClientFunction:GetCache()
		local cache = self.instance:FindFirstChild("Cache")
		if cache then
			return cache.Value
		else
			return 0
		end
	end
	function NetClientFunction:CallServer(...)
		local args = { ... }
		if self.lastPing < os.time() + self:GetCache() then
			local result = self.instance:InvokeServer(unpack(args))
			self.cached = result
			self.lastPing = os.time()
			return result
		else
			return self.cached
		end
	end
	NetClientFunction.CallServerAsync = TS.async(function(self, ...)
		local args = { ... }
		return self:CallServer(unpack(args))
	end)
end
return {
	default = NetClientFunction,
}
