-- Compiled with roblox-ts v1.0.0-beta.16
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
	function ClientDefinitionBuilder:constructor(declarations)
		self.declarations = declarations
	end
	function ClientDefinitionBuilder:Get(k)
		local item = self.declarations[k]
		local _0 = item and item.Type
		local _1 = "'" .. k .. "' is not defined in this definition."
		assert(_0, _1)
		if item.Type == "Function" then
			return ClientFunction.new(k)
		elseif item.Type == "AsyncFunction" then
			return ClientAsyncFunction.new(k)
		elseif item.Type == "Event" then
			return ClientEvent.new(k)
		end
		error("Invalid Type")
	end
	function ClientDefinitionBuilder:OnEvent(name, fn)
		local result = self:Get(name)
		result:Connect(fn)
	end
	function ClientDefinitionBuilder:OnFunction(name, fn)
		local result = self:Get(name)
		result:SetCallback(fn)
	end
end
return {
	ClientDefinitionBuilder = ClientDefinitionBuilder,
}
