-- Compiled with roblox-ts v1.0.0-beta.16
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local ServerAsyncFunction = TS.import(script, script.Parent.Parent, "server", "ServerAsyncFunction").default
local ServerEvent = TS.import(script, script.Parent.Parent, "server", "ServerEvent").default
local ServerFunction = TS.import(script, script.Parent.Parent, "server", "ServerFunction").default
local ServerDefinitionBuilder
do
	ServerDefinitionBuilder = setmetatable({}, {
		__tostring = function()
			return "ServerDefinitionBuilder"
		end,
	})
	ServerDefinitionBuilder.__index = ServerDefinitionBuilder
	function ServerDefinitionBuilder.new(...)
		local self = setmetatable({}, ServerDefinitionBuilder)
		self:constructor(...)
		return self
	end
	function ServerDefinitionBuilder:constructor(declarations)
		self.declarations = declarations
	end
	function ServerDefinitionBuilder:OnEvent(name, fn)
		local result = self:Create(name)
		result:Connect(fn)
	end
	function ServerDefinitionBuilder:Create(k)
		local item = self.declarations[k]
		local _0 = item and item.Type
		local _1 = "'" .. k .. "' is not defined in this definition."
		assert(_0, _1)
		if item.Type == "Function" then
			if item.ServerMiddleware then
				return ServerFunction.new(k, item.ServerMiddleware)
			else
				return ServerFunction.new(k)
			end
		elseif item.Type == "AsyncFunction" then
			if item.ServerMiddleware then
				return ServerAsyncFunction.new(k, item.ServerMiddleware)
			else
				return ServerAsyncFunction.new(k)
			end
		elseif item.Type == "Event" then
			if item.ServerMiddleware then
				return ServerEvent.new(k, item.ServerMiddleware)
			else
				return ServerEvent.new(k)
			end
		end
		error("Invalid Type")
	end
	function ServerDefinitionBuilder:OnFunction(name, fn)
		local result = self:Create(name)
		result:SetCallback(fn)
	end
end
return {
	ServerDefinitionBuilder = ServerDefinitionBuilder,
}
