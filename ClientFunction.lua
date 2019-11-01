-- Compiled with https://roblox-ts.github.io v0.2.15-commit-40ebc6b.0
-- November 1, 2019, 10:25 PM Coordinated Universal Time

local TS = require(script.Parent.vendor.RuntimeLib);
local exports = {};
local NetClientFunction;
local _0 = TS.import(script, script.Parent, "internal");
local getRemoteOrThrow, IS_CLIENT, functionExists, waitForFunction, MAX_CLIENT_WAITFORCHILD_TIMEOUT = _0.getRemoteOrThrow, _0.IS_CLIENT, _0.functionExists, _0.waitForFunction, _0.MAX_CLIENT_WAITFORCHILD_TIMEOUT;
do
	NetClientFunction = setmetatable({}, {
		__tostring = function() return "NetClientFunction" end;
	});
	NetClientFunction.__index = NetClientFunction;
	function NetClientFunction.new(...)
		local self = setmetatable({}, NetClientFunction);
		self:constructor(...);
		return self;
	end;
	function NetClientFunction:constructor(name)
		self.lastPing = -1;
		self.cached = {};
		self.getCache = function()
			warn(self.instance.Name .. "::getCache is deprecated, use " .. self.instance.Name .. "::GetCache instead!");
			return self:GetCache();
		end;
		self.getInstance = function()
			warn(self.instance.Name .. "::getInstance is deprecated, use " .. self.instance.Name .. "::GetInstance instead!");
			return self:GetInstance();
		end;
		self.instance = getRemoteOrThrow("RemoteFunction", name);
		assert(IS_CLIENT, "Cannot create a Net.ClientFunction on the Server!");
		assert(functionExists(name), "The specified function '" .. name .. "' does not exist!");
	end;
	-- static methods
	NetClientFunction.WaitFor = TS.async(function(self, name)
		local fun = waitForFunction(name, MAX_CLIENT_WAITFORCHILD_TIMEOUT);
		if not (fun) then
			error("Failed to retrieve client Function!");
		end;
		return NetClientFunction.new(name);
	end);
	-- instance methods
	function NetClientFunction:GetInstance()
		return self.instance;
	end;
	function NetClientFunction:GetCache()
		local cache = self.instance:FindFirstChild("Cache");
		if cache then
			return cache.Value;
		else
			return 0;
		end;
	end;
	function NetClientFunction:CallServer(...)
		local args = { ... };
		if self.lastPing < os.time() + self:GetCache() then
			local result = self.instance:InvokeServer(unpack(args));
			self.cached = result;
			self.lastPing = os.time();
			return result;
		else
			return self.cached;
		end;
	end;
	NetClientFunction.CallServerAsync = TS.async(function(self, ...)
		local args = { ... };
		return self:CallServer(unpack(args));
	end);
end;
exports.default = NetClientFunction;
return exports;
