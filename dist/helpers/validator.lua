-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local isMixed = TS.import(script, script.Parent, "tables").isMixed
local Workspace = game:GetService("Workspace")
local ServerStorage = game:GetService("ServerStorage")
local ServerScriptService = game:GetService("ServerScriptService")
-- * @internal
local isSerializable
local function validateArguments(...)
	local args = { ... }
	for index, value in ipairs(args) do
		if not isSerializable.check(value) then
			local _0 = isSerializable.errorMessage
			local _1 = index
			error(string.format(_0, _1), 2)
		end
		local _0 = value
		if typeof(_0) == "Instance" then
			if value:IsDescendantOf(ServerStorage) or value:IsDescendantOf(ServerScriptService) then
				error("[rbx-net] Instance at argument #" .. tostring(index) .. " is inside a server-only container and cannot be sent via remotes.")
			end
			if not value:IsDescendantOf(game) then
				error("[rbx-net] Instance at argument #" .. tostring(index) .. " is not a valid descendant of game, and wont replicate")
			end
		end
	end
end
-- * @internal
isSerializable = {
	errorMessage = "Argument #%d is not serializable. - see http://docs.vorlias.com/rbx-net/docs/2.0/serialization",
	check = function(value)
		-- Can't allow functions or threads
		local _0 = value
		local _1 = type(_0) == "function"
		if not _1 then
			local _2 = value
			_1 = type(_2) == "thread"
		end
		if _1 then
			return false
		end
		-- Can't allow metatabled objects
		local _2 = value
		local _3 = type(_2) == "table"
		if _3 then
			_3 = getmetatable(value) ~= nil
		end
		if _3 then
			return false
		end
		-- Ensure not a mixed table type
		local _4 = value
		if type(_4) == "table" then
			return not isMixed(value)
		end
		return true
	end,
}
-- * @internal
local function oneOf(...)
	local values = { ... }
	local _0 = {}
	local _1 = "errorMessage"
	-- ▼ ReadonlyArray.join ▼
	local _2 = ", "
	if _2 == nil then
		_2 = ", "
	end
	-- ▲ ReadonlyArray.join ▲
	_0[_1] = "Expected one of: " .. table.concat(values, _2)
	_0.check = function(value)
		local _3 = value
		if not (type(_3) == "string") then
			return false
		end
		for _, cmpValue in ipairs(values) do
			if value == cmpValue then
				return true
			end
		end
		return false
	end
	return _0
end
return {
	validateArguments = validateArguments,
	oneOf = oneOf,
	isSerializable = isSerializable,
}
