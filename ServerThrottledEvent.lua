-- Compiled with https://roblox-ts.github.io v0.2.14
-- August 13, 2019, 4:51 PM New Zealand Standard Time

local TS = require(script.Parent.vendor.RuntimeLib);
local exports = {};
local NetServerEvent = TS.import(script.Parent, "ServerEvent").default;
local errorft = TS.import(script.Parent, "internal").errorft;
local throttler = TS.import(script.Parent, "Throttle");
local GetConfiguration = TS.import(script.Parent, "configuration").GetConfiguration;
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
	function NetServerThrottledEvent:constructor(name, rateLimit)
		super.constructor(self, name);
		self.maxRequestsPerMinute = 0;
		self.setRateLimit = function(requestsPerMinute)
			warn(self.instance.Name .. "::setRateLimit is deprecated, use " .. self.instance.Name .. "::SetRateLimit instead!");
			return self:SetRateLimit(requestsPerMinute);
		end;
		self.getRateLimit = function()
			warn(self.instance.Name .. "::getRateLimit is deprecated, use " .. self.instance.Name .. "::GetRateLimit instead!");
			return self:GetRateLimit();
		end;
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
