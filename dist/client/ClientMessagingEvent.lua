-- Compiled with roblox-ts v1.1.1
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local getGlobalRemoteId = TS.import(script, script.Parent.Parent, "internal").getGlobalRemote
local ClientEvent = TS.import(script, script.Parent, "ClientEvent").default
--[[
	*
	* Client counter-part to GlobalServerEvent
]]
local ClientMessagingEvent
do
	ClientMessagingEvent = setmetatable({}, {
		__tostring = function()
			return "ClientMessagingEvent"
		end,
	})
	ClientMessagingEvent.__index = ClientMessagingEvent
	function ClientMessagingEvent.new(...)
		local self = setmetatable({}, ClientMessagingEvent)
		self:constructor(...)
		return self
	end
	function ClientMessagingEvent:constructor(name)
		self.instance = ClientEvent.new(getGlobalRemoteId(name))
	end
	function ClientMessagingEvent:Connect(callback)
		self.instance:Connect(callback)
	end
end
return {
	default = ClientMessagingEvent,
}
