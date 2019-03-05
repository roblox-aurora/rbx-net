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
			serialized[index] = self:serialize(value)
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

return Serializer
