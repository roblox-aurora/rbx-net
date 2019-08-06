-- Compiled with https://roblox-ts.github.io v0.2.14
-- August 6, 2019, 5:11 PM New Zealand Standard Time

local TS = require(script.Parent.vendor.RuntimeLib);
local exports = {};
local NetClientEvent;
local _0 = TS.import(script.Parent, "internal");
local getRemoteOrThrow, IS_CLIENT, waitForEvent, MAX_CLIENT_WAITFORCHILD_TIMEOUT = _0.getRemoteOrThrow, _0.IS_CLIENT, _0.waitForEvent, _0.MAX_CLIENT_WAITFORCHILD_TIMEOUT;
do
	NetClientEvent = setmetatable({}, {
		__tostring = function() return "NetClientEvent" end;
	});
	NetClientEvent.__index = NetClientEvent;
	function NetClientEvent.new(...)
		local self = setmetatable({}, NetClientEvent);
		self:constructor(...);
		return self;
	end;
	function NetClientEvent:constructor(name)
		self.instance = getRemoteOrThrow("RemoteEvent", name);
		assert(IS_CLIENT, "Cannot create a Net.ClientEvent on the Server!");
	end;
	NetClientEvent.WaitFor = TS.async(function(self, name)
		local fun = waitForEvent(name, MAX_CLIENT_WAITFORCHILD_TIMEOUT);
		if not fun then
			error("Failed to retrieve client Event!");
		end;
		return NetClientEvent.new(name);
	end);
	function NetClientEvent:getInstance()
		return self.instance;
	end;
	function NetClientEvent:getEvent()
		return self.instance.OnClientEvent;
	end;
	function NetClientEvent:Connect(callback)
		return self:getEvent():Connect(callback);
	end;
	function NetClientEvent:SendToServer(...)
		local args = { ... };
		self.instance:FireServer(unpack(args));
	end;
end;
exports.default = NetClientEvent;
return exports;
