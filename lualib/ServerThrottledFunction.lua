-- Compiled with https://roblox-ts.github.io v0.2.14
-- August 6, 2019, 7:32 PM New Zealand Standard Time

local TS = require(script.Parent.vendor.RuntimeLib);
local exports = {};
local _0 = TS.import(script.Parent, "internal");
local RequestCounter, errorft = _0.RequestCounter, _0.errorft;
local throttler = TS.import(script.Parent, "Throttle");
local GetConfiguration = TS.import(script.Parent, "configuration").GetConfiguration;
local NetServerFunction = TS.import(script.Parent, "ServerFunction").default;
local NetServerThrottledFunction;
do
	local super = NetServerFunction;
	NetServerThrottledFunction = setmetatable({}, {
		__index = super;
		__tostring = function() return "NetServerThrottledFunction" end;
	});
	NetServerThrottledFunction.__index = NetServerThrottledFunction;
	function NetServerThrottledFunction.new(...)
		local self = setmetatable({}, NetServerThrottledFunction);
		self:constructor(...);
		return self;
	end;
	function NetServerThrottledFunction:constructor(name, rateLimit)
		super.constructor(self, name);
		self.maxRequestsPerMinute = 0;
		self.maxRequestsPerMinute = rateLimit;
		self.clientRequests = throttler:Get("Function~" .. name);
		local clientValue = Instance.new("IntValue", self.instance);
		clientValue.Name = "RateLimit";
		clientValue.Value = rateLimit;
	end;
	function NetServerThrottledFunction:setCallback(callback)
		self.instance.OnServerInvoke = function(player, ...)
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
				return callback(player, unpack(args));
			end;
		end;
		return self;
	end;
	function NetServerThrottledFunction:setRateLimit(requestsPerMinute)
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
	function NetServerThrottledFunction:getRateLimit()
		return self.maxRequestsPerMinute;
	end;
	NetServerThrottledFunction.rates = {};
end;
exports.default = NetServerThrottledFunction;
return exports;
