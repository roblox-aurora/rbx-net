


local TS = require(script.Parent.vendor.RuntimeLib);
local exports = {};
local NetServerEvent = TS.import(script, script.Parent, "ServerEvent").default;
local errorft = TS.import(script, script.Parent, "internal").errorft;
local throttler = TS.import(script, script.Parent, "Throttle");
local GetConfiguration = TS.import(script, script.Parent, "configuration").GetConfiguration;
local NetServerThrottledEvent;
do
	local super = NetServerEvent;
	NetServerThrottledEvent = setmetatable({}, {
		__index = super;
		__tostring = function() return "NetServerThrottledEvent" end;
	});
	NetServerThrottledEvent.__index = NetServerThrottledEvent;
	function NetServerThrottledEvent.new(...)
		local self = setmetatable({}, NetServerThrottledEvent);
		self:constructor(...);
		return self;
	end;
	function NetServerThrottledEvent:constructor(name, rateLimit, ...)
		super.constructor(self, name, unpack(recievedPropTypes));
		local recievedPropTypes = { ... };
		self.maxRequestsPerMinute = 0;
		self.maxRequestsPerMinute = rateLimit;
		self.clientRequests = throttler:Get("Event~" .. name);
		local clientValue = Instance.new("IntValue", self.instance);
		clientValue.Name = "RateLimit";
		clientValue.Value = rateLimit;
	end;
	function NetServerThrottledEvent:Connect(callback)
		return self.instance.OnServerEvent:Connect(function(player, ...)
			local args = { ... };
			local maxRequests = self.maxRequestsPerMinute;
			local clientRequestCount = self.clientRequests:Get(player);
			if clientRequestCount >= maxRequests then
				errorft(GetConfiguration("ServerThrottleMessage"), {
					player = player.UserId;
					remote = self.instance.Name;
					limit = maxRequests;
				});
			else
				self.clientRequests:Increment(player);
				callback(player, unpack((args)));
			end;
		end);
	end;
	function NetServerThrottledEvent:SetRateLimit(requestsPerMinute)
		self.maxRequestsPerMinute = requestsPerMinute;
		local clientValue = self.instance:FindFirstChild("RateLimit");
		if clientValue then
			clientValue.Value = requestsPerMinute;
		else
			clientValue = Instance.new("IntValue", self.instance);
			clientValue.Name = "RateLimit";
			clientValue.Value = requestsPerMinute;
		end;
	end;
	function NetServerThrottledEvent:GetRateLimit()
		return self.maxRequestsPerMinute;
	end;
end;
exports.default = NetServerThrottledEvent;
return exports;
