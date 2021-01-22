-- Compiled with roblox-ts v1.0.0-beta.15
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
	function ServerDefinitionBuilder:constructor(decl)
		self.decl = decl
	end
	function ServerDefinitionBuilder:ConnectEvent(name, fn)
		local result = self:Create(name)
		result:Connect(fn)
	end
	function ServerDefinitionBuilder:Create(k)
		local item = self.decl[k]
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
end
return {
	ServerDefinitionBuilder = ServerDefinitionBuilder,
}
