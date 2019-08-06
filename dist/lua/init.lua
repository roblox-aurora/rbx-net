-- Compiled with https://roblox-ts.github.io v0.2.14
-- August 6, 2019, 5:15 PM New Zealand Standard Time

local TS = require(script.vendor.RuntimeLib);
local exports;
local Net;
local throttler = TS.import(script, "Throttle");
local Serializer = TS.import(script, "Serializer");
local config = TS.import(script, "configuration");
local _0 = TS.import(script, "internal");
local functionExists, eventExists, ServerTickFunctions = _0.functionExists, _0.eventExists, _0.ServerTickFunctions;
local NetServerEvent = TS.import(script, "ServerEvent").default;
local NetClientEvent = TS.import(script, "ClientEvent").default;
local NetClientFunction = TS.import(script, "ClientFunction").default;
local NetServerFunction = TS.import(script, "ServerFunction").default;
local NetServerThrottledFunction = TS.import(script, "ServerThrottledFunction").default;
local NetServerThrottledEvent = TS.import(script, "ServerThrottledEvent").default;
local NetGlobalEvent = TS.import(script, "GlobalEvent").default;
local NetGlobalServerEvent = TS.import(script, "GlobalServerEvent").default;
local runService = game:GetService("RunService");
local IS_CLIENT = (__LEMUR__ and not runService:IsServer()) or runService:IsClient();
local IS_SERVER = runService:IsServer();
local IS_STUDIO = runService:IsStudio();
Net = Net or {} do
	local _1 = Net;
	local SetConfiguration = config.SetConfiguration;
	local GetConfiguration = config.GetConfiguration;
	local VERSION = {
		number = {
			major = 1;
			minor = 0;
			revision = 12;
		};
		date = 190602;
		tag = "release";
	};
	setmetatable(VERSION, {
		__tostring = function(self)
			local _2 = self.number;
			local major = _2.major;
			local minor = _2.minor;
			local revision = _2.revision;
			return tostring(major) .. "." .. tostring(minor) .. "." .. tostring(revision);
		end;
	});
	local ServerEvent = NetServerEvent;
	local ClientEvent = NetClientEvent;
	local ClientFunction = NetClientFunction;
	local ServerFunction = NetServerFunction;
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
			if (typeof(nameOrOptions) == "string") then
				return NetServerFunction.new(nameOrOptions);
			else
				local fn;
				if nameOrOptions.rateLimit ~= nil then
					fn = NetServerThrottledFunction.new(nameOrOptions.name, nameOrOptions.rateLimit);
				else
					fn = NetServerFunction.new(nameOrOptions.name);
				end;
				if nameOrOptions.callback then
					fn:setCallback(nameOrOptions.callback);
				end;
				if nameOrOptions.cacheSeconds then
					fn:setClientCache(nameOrOptions.cacheSeconds);
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
	if IS_STUDIO then
		print("[rbx-net] Loaded rbx-net", "v" .. tostring(VERSION));
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
	_1.SetConfiguration = SetConfiguration;
	_1.GetConfiguration = GetConfiguration;
	_1.VERSION = VERSION;
	_1.ServerEvent = ServerEvent;
	_1.ClientEvent = ClientEvent;
	_1.ClientFunction = ClientFunction;
	_1.ServerFunction = ServerFunction;
	_1.GlobalEvent = GlobalEvent;
	_1.GlobalServerEvent = GlobalServerEvent;
	_1.ServerThrottledEvent = ServerThrottledEvent;
	_1.ServerThrottledFunction = ServerThrottledFunction;
	_1.IsClient = IsClient;
	_1.IsServer = IsServer;
	_1.Serialize = Serialize;
	_1.Deserialize = Deserialize;
	_1.IsSerializable = IsSerializable;
	_1.CreateFunction = CreateFunction;
	_1.CreateThrottledFunction = CreateThrottledFunction;
	_1.CreateThrottledEvent = CreateThrottledEvent;
	_1.CreateEvent = CreateEvent;
	_1.WaitForClientFunctionAsync = WaitForClientFunctionAsync;
	_1.WaitForClientEventAsync = WaitForClientEventAsync;
	_1.GetServerEventAsync = GetServerEventAsync;
	_1.GetServerFunctionAsync = GetServerFunctionAsync;
end;
exports = Net;
return exports;
