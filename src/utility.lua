local function isMixedTable(value)
	if type(value) ~= "table" then
		return false
	end

	local num = #value

	if num > 0 then
		-- This should always grab any non-numeric keys
		local lastIndex = next(value, #num)
		if lastIndex ~= nil then
			return true
		end
	end

	return false
end

local function isNetworkMap(value)
	for key in pairs(value) do
		if type(key) ~= "string" then
			return false
		end
	end

	return true
end

local function isNetworkTable(value)
	if type(value) ~= "table" then
		return false
	end

	return getmetatable(value) == nil and not isMixedTable(value)
end

local function isValidInstance(value)
	return typeof(value) == "Instance" and value:IsDescendantOf(game)
end

local function isNetworkValue(value)
	return type(value) == "string" or type(value) == "number" or type(value) == "boolean" or isNetworkTable(value) or
		isValidInstance(value)
end

return {
	IsNetworkTable = isNetworkTable,
	IsNetworkValue = isNetworkValue,
	IsNetworkMap = isNetworkMap
}
