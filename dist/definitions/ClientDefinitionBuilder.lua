-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local ClientAsyncFunction = TS.import(script, script.Parent.Parent, "client", "ClientAsyncFunction").default
local ClientEvent = TS.import(script, script.Parent.Parent, "client", "ClientEvent").default
local ClientFunction = TS.import(script, script.Parent.Parent, "client", "ClientFunction").default
local ClientDefinitionBuilder
do
	ClientDefinitionBuilder = setmetatable({}, {
		__tostring = function()
			return "ClientDefinitionBuilder"
		end,
	})
	ClientDefinitionBuilder.__index = ClientDefinitionBuilder
	function ClientDefinitionBuilder.new(...)
		local self = setmetatable({}, ClientDefinitionBuilder)
		self:constructor(...)
		return self
	end
	function ClientDefinitionBuilder:constructor(decl)
		self.decl = decl
	end
	function ClientDefinitionBuilder:Get(k)
		local item = self.decl[k]
		if item.Type == "Function" then
			return ClientFunction.new(k)
		elseif item.Type == "AsyncFunction" then
			return ClientAsyncFunction.new(k)
		elseif item.Type == "Event" then
			return ClientEvent.new(k)
		end
		error("Invalid Type")
	end
	function ClientDefinitionBuilder:ConnectEvent(name, fn)
		local result = self:Get(name)
		result:Connect(fn)
	end
end
return {
	ClientDefinitionBuilder = ClientDefinitionBuilder,
}
