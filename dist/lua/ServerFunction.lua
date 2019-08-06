-- Compiled with https://roblox-ts.github.io v0.2.14
-- August 6, 2019, 5:15 PM New Zealand Standard Time

local TS = require(script.Parent.vendor.RuntimeLib);
local exports = {};
local _0 = TS.import(script.Parent, "internal");
local findOrCreateRemote, IS_CLIENT = _0.findOrCreateRemote, _0.IS_CLIENT;
local NetServerFunction;
do
	NetServerFunction = setmetatable({}, {
		__tostring = function() return "NetServerFunction" end;
	});
	NetServerFunction.__index = NetServerFunction;
	function NetServerFunction.new(...)
		local self = setmetatable({}, NetServerFunction);
		self:constructor(...);
		return self;
	end;
	function NetServerFunction:constructor(name)
		self.instance = findOrCreateRemote("RemoteFunction", name);
		assert(not IS_CLIENT, "Cannot create a Net.ServerFunction on the Client!");
	end;
	function NetServerFunction:getCallback()
		return self.instance.OnServerInvoke;
	end;
	function NetServerFunction:setCallback(func)
		self.instance.OnServerInvoke = func;
		return self;
	end;
	function NetServerFunction:getInstance()
		return self.instance;
	end;
	function NetServerFunction:getClientCache()
		local cache = self.instance:FindFirstChild("Cache");
		if cache then
			return cache.Value;
		else
			return 0;
		end;
	end;
	function NetServerFunction:setClientCache(time)
		local cache = self.instance:FindFirstChild("Cache");
		if not cache then
			local cacheTimer = Instance.new("NumberValue", self.instance);
			cacheTimer.Value = time;
			cacheTimer.Name = "Cache";
		else
			cache.Value = time;
		end;
		return self;
	end;
	NetServerFunction.CallPlayerAsync = TS.async(function(self, player, ...)
		local args = { ... };
		warn("[rbx-net] CallPlayerAsync is possibly going to be removed\n" .. "\tsee https://github.com/roblox-aurora/rbx-net/issues/13 for more details.");
		return self.instance:InvokeClient(player, unpack(args));
	end);
end;
exports.default = NetServerFunction;
return exports;
