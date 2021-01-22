-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local _0 = TS.import(script, script.Parent.Parent, "internal")
local getRemoteOrThrow = _0.getRemoteOrThrow
local IS_SERVER = _0.IS_SERVER
local waitForRemote = _0.waitForRemote
local ClientEvent
do
	ClientEvent = setmetatable({}, {
		__tostring = function()
			return "ClientEvent"
		end,
	})
	ClientEvent.__index = ClientEvent
	function ClientEvent.new(...)
		local self = setmetatable({}, ClientEvent)
		self:constructor(...)
		return self
	end
	function ClientEvent:constructor(name)
		self.instance = getRemoteOrThrow("RemoteEvent", name)
		local _1 = not IS_SERVER
		assert(_1, "Cannot fetch NetClientEvent on the server!")
	end
	function ClientEvent:GetInstance()
		return self.instance
	end
	function ClientEvent:Wait(name)
		return TS.Promise.defer(TS.async(function(resolve)
			TS.await(waitForRemote("RemoteEvent", name, 10))
			resolve(ClientEvent.new(name))
		end))
	end
	function ClientEvent:SendToServer(...)
		local args = { ... }
		self.instance:FireServer(unpack(args))
	end
	function ClientEvent:Connect(callback)
		return self.instance.OnClientEvent:Connect(callback)
	end
end
local default = ClientEvent
return {
	default = default,
}
