-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local ClientDefinitionBuilder = TS.import(script, script.Parent, "ClientDefinitionBuilder").ClientDefinitionBuilder
local ServerDefinitionBuilder = TS.import(script, script.Parent, "ServerDefinitionBuilder").ServerDefinitionBuilder
--[[
	*
	* @internal Only accessible as an object internally.
]]
local _NetDefinitionBuilders
do
	_NetDefinitionBuilders = setmetatable({}, {
		__tostring = function()
			return "_NetDefinitionBuilders"
		end,
	})
	_NetDefinitionBuilders.__index = _NetDefinitionBuilders
	function _NetDefinitionBuilders.new(...)
		local self = setmetatable({}, _NetDefinitionBuilders)
		self:constructor(...)
		return self
	end
	function _NetDefinitionBuilders:constructor(declarations)
		self.declarations = declarations
		self.Server = ServerDefinitionBuilder.new(self.declarations)
		self.Client = ClientDefinitionBuilder.new(self.declarations)
	end
end
--[[
	*
	* The DefinitionBuilders type
]]
return {
	_NetDefinitionBuilders = _NetDefinitionBuilders,
}
