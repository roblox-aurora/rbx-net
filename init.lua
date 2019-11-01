-- Compiled with https://roblox-ts.github.io v0.2.15-commit-40ebc6b.0
-- November 1, 2019, 10:25 PM Coordinated Universal Time

local TS = require(script.vendor.RuntimeLib);
local exports;
local Net;
local throttler = TS.import(script, script, "Throttle");
local Serializer = TS.import(script, script, "Serializer");
local config = TS.import(script, script, "configuration");
local _0 = TS.import(script, script, "internal");
local functionExists, eventExists, ServerTickFunctions = _0.functionExists, _0.eventExists, _0.ServerTickFunctions;
local NetServerEvent = TS.import(script, script, "ServerEvent").default;
local NetClientEvent = TS.import(script, script, "ClientEvent").default;
local NetClientFunction = TS.import(script, script, "ClientFunction").default;
local NetServerFunction = TS.import(script, script, "ServerFunction").default;
local NetServerThrottledFunction = TS.import(script, script, "ServerThrottledFunction").default;
local NetServerThrottledEvent = TS.import(script, script, "ServerThrottledEvent").default;
local NetGlobalEvent = TS.import(script, script, "GlobalEvent").default;
local NetGlobalServerEvent = TS.import(script, script, "GlobalServerEvent").default;
local NetServerAsyncFunction = TS.import(script, script, "ServerAsyncFunction").default;
local NetClientAsyncFunction = TS.import(script, script, "ClientAsyncFunction").default;
local runService = game:GetService("RunService");
local _1 = __LEMUR__;
local _2 = _1 and not (runService:IsServer());
local IS_CLIENT = _2 or runService:IsClient();
local IS_SERVER = runService:IsServer();
Net = Net or {} do
	local _3 = Net;
	local SetConfiguration = config.SetConfiguration;
	local SetClientConfiguration = config.SetClientConfiguration;
	local GetConfiguration = config.GetConfiguration;
	local VERSION = {};
	VERSION.number = {
		major = 1;
		minor = 2;
		revision = 0;
	};
	VERSION.date = 190602;
	local _4;
	if IS_LUA_MODULE ~= nil then
		_4 = "lua";
	else
		_4 = "ts";
	end;
	VERSION.tag = _4;
	setmetatable(VERSION, {
		__tostring = function(self)
			local _5 = self.number;
			local major = _5.major;
			local minor = _5.minor;
			local revision = _5.revision;
			local _6;
			if IS_LUA_MODULE ~= nil then
				_6 = "-lua";
			else
				_6 = "";
			end;
			return tostring(major) .. "." .. tostring(minor) .. "." .. tostring(revision) .. _6;
		end;
	});
	local ServerEvent = NetServerEvent;
	local ClientEvent = NetClientEvent;
	local ClientFunction = NetClientFunction;
	local ClientAsyncFunction = NetClientAsyncFunction;
	local ServerFunction = NetServerFunction;
	local ServerAsyncFunction = NetServerAsyncFunction;
	local GlobalEvent = NetGlobalEvent;
	local GlobalServerEvent = NetGlobalServerEvent;
	local ServerThrottledEvent = NetServerThrottledEvent;
	local ServerThrottledFunction = NetServerThrottledFunction;
	local function IsClient()
		return IS_CLIENT;
	end;
	local function IsServer()
		return IS_SERVER;
	end;
	local Serialize = Serializer.Serialize;
	local Deserialize = Serializer.Deserialize;
	local IsSerializable = Serializer.IsSerializable;
	local function CreateFunction(nameOrOptions)
		if IS_SERVER then
			if type(nameOrOptions) == "string" then
				return NetServerFunction.new(nameOrOptions);
			else
				local fn;
				if nameOrOptions.rateLimit ~= nil then
					fn = NetServerThrottledFunction.new(nameOrOptions.name, nameOrOptions.rateLimit);
				else
					fn = NetServerFunction.new(nameOrOptions.name);
				end;
				if nameOrOptions.callback then
					fn:SetCallback(nameOrOptions.callback);
				end;
				local _5 = nameOrOptions.cacheSeconds;
				if _5 ~= 0 and _5 == _5 and _5 then
					fn:SetClientCache(nameOrOptions.cacheSeconds);
				end;
				return fn;
			end;
		else
			error("Net.createFunction can only be used on the server!");
			error("");
		end;
	end;
	local function CreateThrottledFunction(name, rateLimit)
		if IS_SERVER then
			return NetServerThrottledFunction.new(name, rateLimit);
		else
			error("Net.createFunction can only be used on the server!");
			error("");
		end;
	end;
	local function CreateThrottledEvent(name, rateLimit)
		if IS_SERVER then
			return NetServerThrottledEvent.new(name, rateLimit);
		else
			error("Net.createFunction can only be used on the server!");
			error("Net.createFunction can only be used on the server!");
		end;
	end;
	local function CreateEvent(name)
		if IS_SERVER then
			return NetServerEvent.new(name);
		else
			error("Net.createFunction can only be used on the server!");
			error("Net.createFunction can only be used on the server!");
		end;
	end;
	local WaitForClientFunctionAsync = TS.async(function(name)
		return NetClientFunction:WaitFor(name);
	end);
	local WaitForClientEventAsync = TS.async(function(name)
		return NetClientEvent:WaitFor(name);
	end);
	local function GetServerEventAsync(name)
		return TS.Promise.new(function(resolve, reject)
			if eventExists(name) then
				local newFunc = ServerEvent.new(name);
				resolve(newFunc);
			else
				reject("Could not find Server Event: " .. name .. " (did you create it on the server?)");
			end;
		end);
	end;
	local function GetServerFunctionAsync(name)
		return TS.Promise.new(function(resolve, reject)
			if functionExists(name) then
				local newFunc = NetServerFunction.new(name);
				resolve(newFunc);
			else
				reject("Could not find Server Function: " .. name .. " (did you create it?)");
			end;
		end);
	end;
	if IS_SERVER then
		local lastTick = 0;
		ServerTickFunctions[#ServerTickFunctions + 1] = function()
			if tick() > lastTick + GetConfiguration("ServerThrottleResetTimer") then
				lastTick = tick();
				throttler:Clear();
			end;
		end;
	end;
	_3.SetConfiguration = SetConfiguration;
	_3.SetClientConfiguration = SetClientConfiguration;
	_3.GetConfiguration = GetConfiguration;
	_3.VERSION = VERSION;
	_3.ServerEvent = ServerEvent;
	_3.ClientEvent = ClientEvent;
	_3.ClientFunction = ClientFunction;
	_3.ClientAsyncFunction = ClientAsyncFunction;
	_3.ServerFunction = ServerFunction;
	_3.ServerAsyncFunction = ServerAsyncFunction;
	_3.GlobalEvent = GlobalEvent;
	_3.GlobalServerEvent = GlobalServerEvent;
	_3.ServerThrottledEvent = ServerThrottledEvent;
	_3.ServerThrottledFunction = ServerThrottledFunction;
	_3.IsClient = IsClient;
	_3.IsServer = IsServer;
	_3.Serialize = Serialize;
	_3.Deserialize = Deserialize;
	_3.IsSerializable = IsSerializable;
	_3.CreateFunction = CreateFunction;
	_3.CreateThrottledFunction = CreateThrottledFunction;
	_3.CreateThrottledEvent = CreateThrottledEvent;
	_3.CreateEvent = CreateEvent;
	_3.WaitForClientFunctionAsync = WaitForClientFunctionAsync;
	_3.WaitForClientEventAsync = WaitForClientEventAsync;
	_3.GetServerEventAsync = GetServerEventAsync;
	_3.GetServerFunctionAsync = GetServerFunctionAsync;
end;
exports = Net;
return exports;
