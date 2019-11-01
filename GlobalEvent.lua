-- Compiled with https://roblox-ts.github.io v0.2.15-commit-40ebc6b.0
-- November 1, 2019, 10:25 PM Coordinated Universal Time

local TS = require(script.Parent.vendor.RuntimeLib);
local exports = {};
local NetGlobalEvent;
local _0 = TS.import(script, script.Parent, "internal");
local ServerTickFunctions, isLuaTable = _0.ServerTickFunctions, _0.isLuaTable;
local MockMessagingService = TS.import(script, script.Parent, "MockMessagingService");
local MessagingService = game:GetService("MessagingService");
local Players = game:GetService("Players");
local IS_STUDIO = game:GetService("RunService"):IsStudio();
local function isSubscriptionMessage(value)
	if isLuaTable(value) then
		local hasData = (value["Data"] ~= nil);
		return hasData;
	else
		return false;
	end;
end;
local function isJobTargetMessage(value)
	if isSubscriptionMessage(value) then
		if isLuaTable(value.Data) then
			return (value.Data["jobId"] ~= nil);
		end;
	end;
	return false;
end;
local globalMessageQueue = {};
local lastQueueTick = 0;
local globalEventMessageCounter = 0;
local globalSubscriptionCounter = 0;
local function processMessageQueue()
	if tick() >= lastQueueTick + 60 then
		globalEventMessageCounter = 0;
		globalSubscriptionCounter = 0;
		lastQueueTick = tick();
		while #globalMessageQueue > 0 do
			local _1 = #globalMessageQueue;
			local message = globalMessageQueue[_1];
			globalMessageQueue[_1] = nil; -- globalMessageQueue.pop
			MessagingService:PublishAsync(message.Name, message.Data);
			globalEventMessageCounter = globalEventMessageCounter + 1;
		end;
		if globalEventMessageCounter >= NetGlobalEvent:GetMessageLimit() then
			warn("[rbx-net] Too many messages are being sent, any further messages will be queued!");
		end;
	end;
end;
do
	NetGlobalEvent = setmetatable({}, {
		__tostring = function() return "NetGlobalEvent" end;
	});
	NetGlobalEvent.__index = NetGlobalEvent;
	function NetGlobalEvent.new(...)
		local self = setmetatable({}, NetGlobalEvent);
		self:constructor(...);
		return self;
	end;
	function NetGlobalEvent:constructor(name)
		self.name = name;
	end;
	-- static methods
	function NetGlobalEvent:GetMessageLimit()
		return 150 + 60 * #Players:GetPlayers();
	end;
	function NetGlobalEvent:GetSubscriptionLimit()
		return 5 + 2 * #Players:GetPlayers();
	end;
	-- instance methods
	function NetGlobalEvent:SendToServer(jobId, message)
		self:SendToAllServers({
			jobId = jobId;
			message = message;
		});
	end;
	function NetGlobalEvent:SendToAllServers(message)
		local limit = NetGlobalEvent:GetMessageLimit();
		if globalEventMessageCounter >= limit then
			warn("[rbx-net] Exceeded message limit of " .. tostring(limit) .. ", adding to queue...");
			globalMessageQueue[#globalMessageQueue + 1] = {
				Name = self.name;
				Data = message;
			};
		else
			globalEventMessageCounter = globalEventMessageCounter + 1;
			TS.Promise.spawn(function()
				local _1 = IS_STUDIO;
				local _2 = _1 and MockMessagingService;
				(_2 or MessagingService):PublishAsync(self.name, message);
			end);
		end;
	end;
	function NetGlobalEvent:Connect(handler)
		local limit = NetGlobalEvent:GetSubscriptionLimit();
		if globalSubscriptionCounter >= limit then
			error("[rbx-net] Exceeded Subscription limit of " .. tostring(limit) .. "!");
		end;
		globalSubscriptionCounter = globalSubscriptionCounter + 1;
		local _1 = IS_STUDIO;
		local _2 = _1 and MockMessagingService;
		return (_2 or MessagingService):SubscribeAsync(self.name, function(recieved)
			local Sent = recieved.Sent;
			if isJobTargetMessage(recieved) then
				local Data = recieved.Data;
				if game.JobId == Data.JobId then
					handler(Data.InnerData, Sent);
				end;
			else
				handler(recieved.Data, Sent);
			end;
		end);
	end;
end;
ServerTickFunctions[#ServerTickFunctions + 1] = processMessageQueue;
exports.isSubscriptionMessage = isSubscriptionMessage;
exports.default = NetGlobalEvent;
return exports;
