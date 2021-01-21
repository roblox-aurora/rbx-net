-- Compiled with roblox-ts v1.0.0-beta.14
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local getGlobalRemoteId = TS.import(script, script.Parent.Parent, "internal").getGlobalRemote
local ClientEvent = TS.import(script, script.Parent, "ClientEvent").default
local CrossServerEvent
do
	CrossServerEvent = setmetatable({}, {
		__tostring = function()
			return "CrossServerEvent"
		end,
	})
	CrossServerEvent.__index = CrossServerEvent
	function CrossServerEvent.new(...)
		local self = setmetatable({}, CrossServerEvent)
		self:constructor(...)
		return self
	end
	function CrossServerEvent:constructor(name)
		self.instance = ClientEvent.new(getGlobalRemoteId(name))
	end
	function CrossServerEvent:Connect(callback)
		self.instance:Connect(callback)
	end
end
return {
	default = CrossServerEvent,
}
