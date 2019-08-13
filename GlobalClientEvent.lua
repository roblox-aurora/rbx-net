-- Compiled with https://roblox-ts.github.io v0.2.14
-- August 13, 2019, 4:24 PM New Zealand Standard Time

local TS = require(script.Parent.vendor.RuntimeLib);
local exports = {};
local getGlobalRemoteId = TS.import(script.Parent, "internal").getGlobalRemote;
local NetClientEvent = TS.import(script.Parent, "ClientEvent").default;
local NetGlobalClientEvent;
do
	NetGlobalClientEvent = setmetatable({}, {
		__tostring = function() return "NetGlobalClientEvent" end;
	});
	NetGlobalClientEvent.__index = NetGlobalClientEvent;
	function NetGlobalClientEvent.new(...)
		local self = setmetatable({}, NetGlobalClientEvent);
		self:constructor(...);
		return self;
	end;
	function NetGlobalClientEvent:constructor(name)
		self.instance = NetClientEvent.new(getGlobalRemoteId(name));
	end;
	function NetGlobalClientEvent:Connect(callback)
		self.instance:Connect(callback);
	end;
end;
exports.default = NetGlobalClientEvent;
return exports;
