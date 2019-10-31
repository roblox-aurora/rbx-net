-- Compiled with https://roblox-ts.github.io v0.2.15-commit-fd67c49.0
-- October 31, 2019, 1:47 AM Coordinated Universal Time

local TS = require(script.Parent.vendor.RuntimeLib);
local exports = {};
local getGlobalRemoteId = TS.import(script, script.Parent, "internal").getGlobalRemote;
local NetClientEvent = TS.import(script, script.Parent, "ClientEvent").default;
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
