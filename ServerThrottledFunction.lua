


local TS = require(script.Parent.vendor.RuntimeLib);
local exports = {};
local errorft = TS.import(script, script.Parent, "internal").errorft;
local throttler = TS.import(script, script.Parent, "Throttle");
local GetConfiguration = TS.import(script, script.Parent, "configuration").GetConfiguration;
local NetServerFunction = TS.import(script, script.Parent, "ServerFunction").default;
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
	function NetServerThrottledFunction:constructor(name, rateLimit, ...)
		super.constructor(self, name, unpack(recievedPropTypes));
		local recievedPropTypes = { ... };
		self.maxRequestsPerMinute = 0;
		self.maxRequestsPerMinute = rateLimit;
		self.clientRequests = throttler:Get("Function~" .. name);
		local clientValue = Instance.new("IntValue", self.instance);
		clientValue.Name = "RateLimit";
		clientValue.Value = rateLimit;
	end;
	function NetServerThrottledFunction:SetCallback(callback)
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
	function NetServerThrottledFunction:SetRateLimit(requestsPerMinute)
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
	function NetServerThrottledFunction:GetRateLimit()
		return self.maxRequestsPerMinute;
	end;
	NetServerThrottledFunction.rates = {};
end;
exports.default = NetServerThrottledFunction;
return exports;
