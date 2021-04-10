-- Compiled with roblox-ts v1.1.1
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local ClientAsyncFunction = TS.import(script, script.Parent.Parent, "client", "ClientAsyncFunction").default
local ClientEvent = TS.import(script, script.Parent.Parent, "client", "ClientEvent").default
local ClientFunction = TS.import(script, script.Parent.Parent, "client", "ClientFunction").default
-- Keep the declarations fully isolated
local declarationMap = setmetatable({}, {
	__mode = "k",
})
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
	function ClientDefinitionBuilder:constructor(declarations, namespace)
		if namespace == nil then
			namespace = ""
		end
		self.namespace = namespace
		local _0 = declarationMap
		local _1 = self
		local _2 = declarations
		-- ▼ Map.set ▼
		_0[_1] = _2
		-- ▲ Map.set ▲
	end
	function ClientDefinitionBuilder:toString()
		return "[" .. "ClientDefinitionBuilder" .. "]"
	end
	function ClientDefinitionBuilder:Get(remoteId)
		local _0 = declarationMap
		local _1 = self
		local item = _0[_1][remoteId]
		local _2
		if self.namespace ~= "" then
			-- ▼ ReadonlyArray.join ▼
			local _3 = ":"
			if _3 == nil then
				_3 = ", "
			end
			-- ▲ ReadonlyArray.join ▲
			_2 = (table.concat({ self.namespace, remoteId }, _3))
		else
			_2 = remoteId
		end
		remoteId = _2
		local _3 = item and item.Type
		local _4 = "'" .. remoteId .. "' is not defined in this definition."
		assert(_3, _4)
		if item.Type == "Function" then
			return ClientFunction.new(remoteId)
		elseif item.Type == "AsyncFunction" then
			return ClientAsyncFunction.new(remoteId)
		elseif item.Type == "Event" then
			return ClientEvent.new(remoteId)
		end
		error("Invalid Type")
	end
	function ClientDefinitionBuilder:GetNamespace(groupName)
		local _0 = declarationMap
		local _1 = self
		local group = _0[_1][groupName]
		local _2 = group.Type == "Namespace"
		assert(_2)
		local _3 = group.Definitions
		local _4
		if self.namespace ~= "" then
			-- ▼ ReadonlyArray.join ▼
			local _5 = ":"
			if _5 == nil then
				_5 = ", "
			end
			-- ▲ ReadonlyArray.join ▲
			_4 = table.concat({ self.namespace, groupName }, _5)
		else
			_4 = groupName
		end
		return _3:_buildClientDefinition(_4)
	end
	ClientDefinitionBuilder.WaitFor = TS.async(function(self, remoteId)
		local _0 = declarationMap
		local _1 = self
		local item = _0[_1][remoteId]
		local _2
		if self.namespace ~= "" then
			-- ▼ ReadonlyArray.join ▼
			local _3 = ":"
			if _3 == nil then
				_3 = ", "
			end
			-- ▲ ReadonlyArray.join ▲
			_2 = (table.concat({ self.namespace, remoteId }, _3))
		else
			_2 = remoteId
		end
		remoteId = _2
		local _3 = item and item.Type
		local _4 = "'" .. remoteId .. "' is not defined in this definition."
		assert(_3, _4)
		if item.Type == "Function" then
			return ClientFunction:Wait(remoteId)
		elseif item.Type == "Event" then
			return ClientEvent:Wait(remoteId)
		elseif item.Type == "AsyncFunction" then
			return ClientAsyncFunction:Wait(remoteId)
		end
		error("Invalid Type")
	end)
	function ClientDefinitionBuilder:OnEvent(name, fn)
		local result = self:Get(name)
		result:Connect(fn)
	end
	function ClientDefinitionBuilder:OnFunction(name, fn)
		local result = self:Get(name)
		result:SetCallback(fn)
	end
	function ClientDefinitionBuilder:__tostring()
		return self:toString()
	end
end
return {
	ClientDefinitionBuilder = ClientDefinitionBuilder,
}
