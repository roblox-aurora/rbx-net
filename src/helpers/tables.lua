local function isMixed(t)
	assert(type(t) == "table")
	local mixed = false
	local _idxType

	for index, value in next, t do
		if _idxType and _idxType ~= type(index) then
			return true
		end

		_idxType = type(index)
		if type(value) == "table" then
			mixed = mixed and isMixed(value) and not (not getmetatable(value))
		end
	end

	return mixed
end

return {
	mixed = isMixed
}