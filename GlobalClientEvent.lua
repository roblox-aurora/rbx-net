
local TS = _G[script]
local getGlobalRemoteId = TS.import(script, script.Parent, "internal").getGlobalRemote
local NetClientEvent = TS.import(script, script.Parent, "ClientEvent").default
--[[
	*
	* Client counter-part to GlobalServerEvent
]]
local NetGlobalClientEvent
do
	NetGlobalClientEvent = setmetatable({}, {
		__tostring = function()
			return "NetGlobalClientEvent"
		end,
	})
	NetGlobalClientEvent.__index = NetGlobalClientEvent
	function NetGlobalClientEvent.new(...)
		local self = setmetatable({}, NetGlobalClientEvent)
		self:constructor(...)
		return self
	end
	function NetGlobalClientEvent:constructor(name)
		self.instance = NetClientEvent.new(getGlobalRemoteId(name))
	end
	function NetGlobalClientEvent:Connect(callback)
		self.instance:Connect(callback)
	end
end
return {
	default = NetGlobalClientEvent,
}
