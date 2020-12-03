
local TS = _G[script]
local _0 = TS.import(script, script.Parent, "internal")
local getRemoteOrThrow = _0.getRemoteOrThrow
local IS_CLIENT = _0.IS_CLIENT
local waitForEvent = _0.waitForEvent
local MAX_CLIENT_WAITFORCHILD_TIMEOUT = _0.MAX_CLIENT_WAITFORCHILD_TIMEOUT
--[[
	*
	* An event on the client
	* @rbxts client
]]
local NetClientEvent
do
	NetClientEvent = setmetatable({}, {
		__tostring = function()
			return "NetClientEvent"
		end,
	})
	NetClientEvent.__index = NetClientEvent
	function NetClientEvent.new(...)
		local self = setmetatable({}, NetClientEvent)
		self:constructor(...)
		return self
	end
	function NetClientEvent:constructor(name)
		self.instance = getRemoteOrThrow("RemoteEvent", name)
		assert(IS_CLIENT, "Cannot create a Net.ClientEvent on the Server!")
	end
	NetClientEvent.WaitFor = TS.async(function(self, name)
		local fun = waitForEvent(name, MAX_CLIENT_WAITFORCHILD_TIMEOUT)
		if not fun then
			error("Failed to retrieve client Event!")
		end
		return NetClientEvent.new(name)
	end)
	function NetClientEvent:Unmanaged(name)
		return getRemoteOrThrow("RemoteEvent", name)
	end
	function NetClientEvent:GetInstance()
		return self.instance
	end
	function NetClientEvent:GetEvent()
		return self.instance.OnClientEvent
	end
	function NetClientEvent:Connect(callback)
		return self:GetEvent():Connect(callback)
	end
	function NetClientEvent:SendToServer(...)
		local args = { ... }
		self.instance:FireServer(unpack(args))
	end
end
return {
	default = NetClientEvent,
}
