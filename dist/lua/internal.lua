-- Compiled with https://roblox-ts.github.io v0.2.14
-- August 6, 2019, 5:11 PM New Zealand Standard Time

local exports = {};
local replicatedStorage = game:GetService("ReplicatedStorage");
local runService = game:GetService("RunService");
local IS_SERVER = runService:IsServer();
local IS_CLIENT = (__LEMUR__ and not runService:IsServer()) or runService:IsClient();
local MAX_CLIENT_WAITFORCHILD_TIMEOUT = 10;
local function getGlobalRemote(name)
	return "$" .. name;
end;
local function isLuaTable(value)
	return (typeof(value) == "table");
end;
local REMOTES_FOLDER_NAME = "Remotes";
local FUNCTIONS_FOLDER_NAME = "Functions";
local EVENTS_FOLDER_NAME = "Events";
local remoteFolder;
local eventFolder;
local functionFolder;
local ServerTickFunctions = {};
local function findOrCreateFolder(parent, name)
	local folder = parent:FindFirstChild(name);
	if folder then
		return folder;
	else
		folder = Instance.new("Folder", parent);
		folder.Name = name;
		return folder;
	end;
end;
remoteFolder = findOrCreateFolder(replicatedStorage, REMOTES_FOLDER_NAME);
functionFolder = findOrCreateFolder(remoteFolder, FUNCTIONS_FOLDER_NAME);
eventFolder = findOrCreateFolder(remoteFolder, EVENTS_FOLDER_NAME);
local function errorft(message, vars)
	message = message:gsub("{([%w_][%w%d_]*)}", function(token)
		return vars[token] or token;
	end);
	error(message, 2);
end;
local function eventExists(name)
	return eventFolder:FindFirstChild(name) ~= nil;
end;
local function functionExists(name)
	return functionFolder:FindFirstChild(name) ~= nil;
end;
local function waitForEvent(name, timeOut)
	return eventFolder:WaitForChild(name, timeOut);
end;
local function waitForFunction(name, timeOut)
	return functionFolder:WaitForChild(name, timeOut);
end;
local function getRemoteFolder(remoteType)
	local targetFolder;
	if remoteType == "RemoteEvent" then
		targetFolder = eventFolder;
	elseif remoteType == "RemoteFunction" then
		targetFolder = functionFolder;
	else
		return error("Invalid type: " .. remoteType);
	end;
	return targetFolder;
end;
local function findRemote(remoteType, name)
	local targetFolder = getRemoteFolder(remoteType);
	local existing = targetFolder:FindFirstChild(name);
	return existing;
end;
local function getRemoteOrThrow(remoteType, name)
	local existing = findRemote(remoteType, name);
	if existing then
		return existing;
	else
		error("Could not find Remote of type " .. remoteType .. " called \"" .. name .. "\"");
	end;
end;
local function findOrCreateRemote(remoteType, name)
	local existing = findRemote(remoteType, name);
	if existing then
		return existing;
	else
		if not IS_SERVER then
			error("Creation of Events or Functions must be done on server!");
		end;
		local remote;
		if remoteType == "RemoteEvent" or remoteType == "RemoteFunction" then
			remote = Instance.new(remoteType);
		else
			error("Invalid Remote Type: " .. remoteType);
		end;
		remote.Name = name;
		remote.Parent = getRemoteFolder(remoteType);
		return remote;
	end;
end;
if IS_SERVER then
	game:GetService("RunService").Stepped:Connect(function(time, step)
		for _0 = 1, #ServerTickFunctions do
			local f = ServerTickFunctions[_0];
			f();
		end;
	end);
end;
exports.IS_SERVER = IS_SERVER;
exports.IS_CLIENT = IS_CLIENT;
exports.MAX_CLIENT_WAITFORCHILD_TIMEOUT = MAX_CLIENT_WAITFORCHILD_TIMEOUT;
exports.getGlobalRemote = getGlobalRemote;
exports.isLuaTable = isLuaTable;
exports.ServerTickFunctions = ServerTickFunctions;
exports.findOrCreateFolder = findOrCreateFolder;
exports.errorft = errorft;
exports.eventExists = eventExists;
exports.functionExists = functionExists;
exports.waitForEvent = waitForEvent;
exports.waitForFunction = waitForFunction;
exports.getRemoteFolder = getRemoteFolder;
exports.findRemote = findRemote;
exports.getRemoteOrThrow = getRemoteOrThrow;
exports.findOrCreateRemote = findOrCreateRemote;
return exports;
