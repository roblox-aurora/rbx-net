local Serializer = {}

function Serializer.Serialize(object)
    if type(object) == "number" or type(object) == "string" or type(object) == "boolean" then
        return object
    end
    if type(object) ~= "table" then
        error("Cannot serialize type: " .. type(object), 2);
    end
    if object["Serialize"] ~= nil then
        return object:Serialize()
    end
    local serialized = {}
    for index, value in pairs(object) do
        if type(value) == "table" then
            serialized[index] = Serializer.Serialize(value)
        else
            serialized[index] = value;
        end
    end
    return serialized
end

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

function Serializer.IsSerializable(value)
    local _type = type(value)
	if _type == "number" or _type == "boolean" or _type == "string" then
		return true
	elseif _type == "table" then
		return not isMixed(value) and not getmetatable(value)
	elseif _type == "userdata" and typeof(_type) ~= "userdata" then -- Instances / Value Types
		return true
	else
		return false
	end
end

function Serializer.Deserialize(serialized, deserializer)
    assert(type(serialized) == "table")
    if deserializer then
        if type(deserializer) == "table" and deserializer["deserialize"] then
            return deserializer:deserialize(serialized)
        end
    end
end

return Serializer