local Throttle = {
	counters = {}
}
local RequestCounter = {}
RequestCounter.__index = RequestCounter

function RequestCounter.new()
	local self = {
		counter = {}
	}

	return setmetatable(self, RequestCounter)
end

function RequestCounter:Get(player)
	local counter = self.counter
	local playerQueue = counter[player.UserId]
	return playerQueue or 0
end

function RequestCounter:Increment(player)
	local counter = self.counter
	local playerQueue = counter[player.UserId]

	if not counter[player.UserId] then
		counter[player.UserId] = 1
	else
		counter[player.UserId] = playerQueue + 1
	end
end

function RequestCounter:__tostring()
	return "RequestCounter"
end

function RequestCounter:ClearAll()
	self.counter = {}
end

function Throttle:Get(name)
	local existing = self.counters[name]
	if (existing) then
		return existing
	else
		local newCounter = RequestCounter.new()
		self.counters[name] = newCounter
		return newCounter
	end
end

function Throttle:Clear()
	for _, counter in pairs(self.counters) do
		counter:ClearAll()
	end
end

return Throttle
