local Serializer = {}

function Serializer.Serialize(object)
	if type(object) ~= "table" then
		error("Cannot serialize non-object", 2)
	end

	if type(object.serialize) == "function" then
		return object:serialize()
	end

	local serialized = {}
	for index, value in next, object do
		if type(value) == "table" then
			serialized[index] = Serializer.Serialize(value)
		else
			serialized[index] = value
		end
	end

	return serialized
end

function Serializer.Deserialize(struct, deserializer)
	if type(deserializer) == "function" then
		return deserializer(struct)
	elseif type(deserializer) == "table" then
		if type(deserializer.deserialize) == "function" then
			return deserializer:deserialize(struct)
		end

		for index, value in next, struct do
			deserializer[index] = value
		end
	end
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

function Serializer.makeDeserializable(class, callback)
	local wrapper = {}
	if (type(callback) == "function") then
		wrapper.deserialize = function(_, serialized)
			return callback(serialized)
		end
	else
		wrapper.deserialize = function(_, serialized, ...)
			local obj = class.new(...)
			for index, value in next, serialized do
				obj[index] = value
			end
			return obj
		end
	end

	return setmetatable(wrapper, {__index = class})
end

return Serializer
