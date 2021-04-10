-- Compiled with roblox-ts v1.1.1
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local ServerAsyncFunction = TS.import(script, script.Parent.Parent, "server", "ServerAsyncFunction").default
local ServerEvent = TS.import(script, script.Parent.Parent, "server", "ServerEvent").default
local ServerFunction = TS.import(script, script.Parent.Parent, "server", "ServerFunction").default
local CollectionService = game:GetService("CollectionService")
-- Tidy up all the types here.
-- Keep the declarations fully isolated
local declarationMap = setmetatable({}, {
	__mode = "k",
})
local remoteEventCache = {}
local remoteAsyncFunctionCache = {}
local remoteFunctionCache = {}
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
	function ServerDefinitionBuilder:constructor(declarations, globalMiddleware, namespace)
		if namespace == nil then
			namespace = ""
		end
		self.globalMiddleware = globalMiddleware
		self.namespace = namespace
		local _0 = declarationMap
		local _1 = self
		local _2 = declarations
		-- ▼ Map.set ▼
		_0[_1] = _2
		-- ▲ Map.set ▲
	end
	function ServerDefinitionBuilder:toString()
		return "[" .. "ServerDefinitionBuilder" .. "]"
	end
	function ServerDefinitionBuilder:OnEvent(name, fn)
		local result = self:Create(name)
		result:Connect(fn)
	end
	function ServerDefinitionBuilder:GetNamespace(groupId)
		local _0 = declarationMap
		local _1 = self
		local group = _0[_1][groupId]
		local _2 = group.Type == "Namespace"
		assert(_2)
		local _3 = group.Definitions
		local _4 = self.globalMiddleware
		local _5
		if self.namespace ~= "" then
			-- ▼ ReadonlyArray.join ▼
			local _6 = ":"
			if _6 == nil then
				_6 = ", "
			end
			-- ▲ ReadonlyArray.join ▲
			_5 = table.concat({ self.namespace, groupId }, _6)
		else
			_5 = groupId
		end
		return _3:_buildServerDefinition(_4, _5)
	end
	function ServerDefinitionBuilder:Create(remoteId)
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
			local func
			-- This should make certain use cases cheaper
			local _5 = remoteFunctionCache
			local _6 = remoteId
			if _5[_6] ~= nil then
				local _7 = remoteFunctionCache
				local _8 = remoteId
				return _7[_8]
			else
				if item.ServerMiddleware then
					func = ServerFunction.new(remoteId, item.ServerMiddleware)
				else
					func = ServerFunction.new(remoteId)
				end
				CollectionService:AddTag(func:GetInstance(), "NetDefinitionManaged")
				local _7 = remoteFunctionCache
				local _8 = remoteId
				local _9 = func
				-- ▼ Map.set ▼
				_7[_8] = _9
				-- ▲ Map.set ▲
			end
			local _7 = self.globalMiddleware
			if _7 ~= nil then
				local _8 = function(mw)
					return func:_use(mw)
				end
				-- ▼ ReadonlyArray.forEach ▼
				for _9, _10 in ipairs(_7) do
					_8(_10, _9 - 1, _7)
				end
				-- ▲ ReadonlyArray.forEach ▲
			end
			return func
		elseif item.Type == "AsyncFunction" then
			local asyncFunction
			-- This should make certain use cases cheaper
			local _5 = remoteAsyncFunctionCache
			local _6 = remoteId
			if _5[_6] ~= nil then
				local _7 = remoteAsyncFunctionCache
				local _8 = remoteId
				return _7[_8]
			else
				if item.ServerMiddleware then
					asyncFunction = ServerAsyncFunction.new(remoteId, item.ServerMiddleware)
				else
					asyncFunction = ServerAsyncFunction.new(remoteId)
				end
				CollectionService:AddTag(asyncFunction:GetInstance(), "NetDefinitionManaged")
				local _7 = remoteAsyncFunctionCache
				local _8 = remoteId
				local _9 = asyncFunction
				-- ▼ Map.set ▼
				_7[_8] = _9
				-- ▲ Map.set ▲
			end
			local _7 = self.globalMiddleware
			if _7 ~= nil then
				local _8 = function(mw)
					return asyncFunction:_use(mw)
				end
				-- ▼ ReadonlyArray.forEach ▼
				for _9, _10 in ipairs(_7) do
					_8(_10, _9 - 1, _7)
				end
				-- ▲ ReadonlyArray.forEach ▲
			end
			return asyncFunction
		elseif item.Type == "Event" then
			local event
			-- This should make certain use cases cheaper
			local _5 = remoteEventCache
			local _6 = remoteId
			if _5[_6] ~= nil then
				local _7 = remoteEventCache
				local _8 = remoteId
				return _7[_8]
			else
				if item.ServerMiddleware then
					event = ServerEvent.new(remoteId, item.ServerMiddleware)
				else
					event = ServerEvent.new(remoteId)
				end
				CollectionService:AddTag(event:GetInstance(), "NetDefinitionManaged")
				local _7 = remoteEventCache
				local _8 = remoteId
				local _9 = event
				-- ▼ Map.set ▼
				_7[_8] = _9
				-- ▲ Map.set ▲
			end
			local _7 = self.globalMiddleware
			if _7 ~= nil then
				local _8 = function(mw)
					return event:_use(mw)
				end
				-- ▼ ReadonlyArray.forEach ▼
				for _9, _10 in ipairs(_7) do
					_8(_10, _9 - 1, _7)
				end
				-- ▲ ReadonlyArray.forEach ▲
			end
			return event
		end
		error("Invalid Type")
	end
	function ServerDefinitionBuilder:OnFunction(name, fn)
		local result = self:Create(name)
		result:SetCallback(fn)
	end
	function ServerDefinitionBuilder:__tostring()
		return self:toString()
	end
end
return {
	ServerDefinitionBuilder = ServerDefinitionBuilder,
}
