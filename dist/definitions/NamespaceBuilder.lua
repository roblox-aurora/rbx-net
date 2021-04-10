-- Compiled with roblox-ts v1.1.1
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local ClientDefinitionBuilder = TS.import(script, script.Parent, "ClientDefinitionBuilder").ClientDefinitionBuilder
local ServerDefinitionBuilder = TS.import(script, script.Parent, "ServerDefinitionBuilder").ServerDefinitionBuilder
local RunService = game:GetService("RunService")
-- Isolate the definitions since we don't need to access them anywhere else.
local declarationMap = setmetatable({}, {
	__mode = "k",
})
--[[
	*
	* A namespace builder. Internally used to construct definition builders
]]
local NamespaceBuilder
do
	NamespaceBuilder = setmetatable({}, {
		__tostring = function()
			return "NamespaceBuilder"
		end,
	})
	NamespaceBuilder.__index = NamespaceBuilder
	function NamespaceBuilder.new(...)
		local self = setmetatable({}, NamespaceBuilder)
		self:constructor(...)
		return self
	end
	function NamespaceBuilder:constructor(declarations)
		local _0 = declarationMap
		local _1 = self
		local _2 = declarations
		-- ▼ Map.set ▼
		_0[_1] = _2
		-- ▲ Map.set ▲
	end
	function NamespaceBuilder:_buildServerDefinition(globalMiddleware, namespace)
		local _0 = RunService:IsServer()
		assert(_0)
		local _1 = declarationMap
		local _2 = self
		return ServerDefinitionBuilder.new(_1[_2], globalMiddleware, namespace)
	end
	function NamespaceBuilder:_buildClientDefinition(namespace)
		local _0 = RunService:IsClient()
		assert(_0)
		local _1 = declarationMap
		local _2 = self
		return ClientDefinitionBuilder.new(_1[_2], namespace)
	end
end
return {
	NamespaceBuilder = NamespaceBuilder,
}
