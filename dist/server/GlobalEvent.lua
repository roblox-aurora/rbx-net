-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local _0 = TS.import(script, script.Parent.Parent, "internal")
local isLuaTable = _0.isLuaTable
local ServerTickFunctions = _0.ServerTickFunctions
-- const MessagingService = game.GetService("MessagingService");
local MessagingService = TS.import(script, script.Parent.Parent, "internal", "MessagingService")
local Players = game:GetService("Players")
local IS_STUDIO = game:GetService("RunService"):IsStudio()
--[[
	*
	* Checks if a value matches that of a subscription message
	* @param value The value
]]
local function isSubscriptionMessage(value)
	if isLuaTable(value) then
		local hasData = value.Data ~= nil
		return hasData
	else
		return false
	end
end
local function isJobTargetMessage(value)
	if isSubscriptionMessage(value) then
		if isLuaTable(value.Data) then
			return value.Data.jobId ~= nil
		end
	end
	return false
end
local globalMessageQueue = {}
local lastQueueTick = 0
local globalEventMessageCounter = 0
local globalSubscriptionCounter = 0
local NetGlobalEvent
local function processMessageQueue()
	if tick() >= lastQueueTick + 60 then
		globalEventMessageCounter = 0
		globalSubscriptionCounter = 0
		lastQueueTick = tick()
		while #globalMessageQueue > 0 do
			-- ▼ Array.pop ▼
			local _1 = #globalMessageQueue
			local _2 = globalMessageQueue[_1]
			globalMessageQueue[_1] = nil
			-- ▲ Array.pop ▲
			local message = _2
			MessagingService:PublishAsync(message.Name, message.Data)
			globalEventMessageCounter += 1
		end
		if globalEventMessageCounter >= NetGlobalEvent:GetMessageLimit() then
			warn("[rbx-net] Too many messages are being sent, any further messages will be queued!")
		end
	end
end
--[[
	*
	* Message Size: 1kB
	* MessagesPerMin: 150 + 60 * NUMPLAYERS
	* MessagesPerTopicMin: 30M
	* MessagesPerUniversePerMin: 30M
	* SubsPerServer: 5 + 2 * numPlayers
	* SubsPerUniverse: 10K
]]
--[[
	*
	* An event that works across all servers
	* @see https://developer.roblox.com/api-reference/class/MessagingService for limits, etc.
]]
do
	NetGlobalEvent = setmetatable({}, {
		__tostring = function()
			return "NetGlobalEvent"
		end,
	})
	NetGlobalEvent.__index = NetGlobalEvent
	function NetGlobalEvent.new(...)
		local self = setmetatable({}, NetGlobalEvent)
		self:constructor(...)
		return self
	end
	function NetGlobalEvent:constructor(name)
		self.name = name
	end
	function NetGlobalEvent:GetMessageLimit()
		return 150 + 60 * #Players:GetPlayers()
	end
	function NetGlobalEvent:GetSubscriptionLimit()
		return 5 + 2 * #Players:GetPlayers()
	end
	function NetGlobalEvent:SendToServer(jobId, message)
		self:SendToAllServers({
			jobId = jobId,
			message = message,
		})
	end
	function NetGlobalEvent:SendToAllServers(message)
		local limit = NetGlobalEvent:GetMessageLimit()
		if globalEventMessageCounter >= limit then
			warn("[rbx-net] Exceeded message limit of " .. tostring(limit) .. ", adding to queue...")
			local _1 = globalMessageQueue
			local _2 = {
				Name = self.name,
				Data = message,
			}
			-- ▼ Array.push ▼
			_1[#_1 + 1] = _2
			-- ▲ Array.push ▲
		else
			globalEventMessageCounter += 1
			-- Since this yields
			MessagingService:PublishAsync(self.name, message)
		end
	end
	function NetGlobalEvent:Connect(handler)
		local limit = NetGlobalEvent:GetSubscriptionLimit()
		if globalSubscriptionCounter >= limit then
			error("[rbx-net] Exceeded Subscription limit of " .. tostring(limit) .. "!")
		end
		globalSubscriptionCounter += 1
		return MessagingService:SubscribeAsync(self.name, function(recieved)
			local _1 = recieved
			local Sent = _1.Sent
			if isJobTargetMessage(recieved) then
				local _2 = recieved
				local Data = _2.Data
				if game.JobId == Data.JobId then
					handler(Data.InnerData, Sent)
				end
			else
				handler(recieved.Data, Sent)
			end
		end)
	end
end
local _1 = ServerTickFunctions
local _2 = processMessageQueue
-- ▼ Array.push ▼
_1[#_1 + 1] = _2
-- ▲ Array.push ▲
return {
	isSubscriptionMessage = isSubscriptionMessage,
	default = NetGlobalEvent,
}
