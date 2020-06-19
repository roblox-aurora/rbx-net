


local exports = {};
local replicatedStorage = game:GetService("ReplicatedStorage");
local runService = game:GetService("RunService");
local IS_SERVER = runService:IsServer();
local _0 = __LEMUR__;
local _1 = _0 and not (runService:IsServer());
local IS_CLIENT = _1 or runService:IsClient();
local MAX_CLIENT_WAITFORCHILD_TIMEOUT = 10;
local function getGlobalRemote(name)
	return "$" .. name;
end;
local function isLuaTable(value)
	return (type(value) == "table");
end;
local REMOTES_FOLDER_NAME = "Remotes";
local FUNCTIONS_FOLDER_NAME = "Functions";
local EVENTS_FOLDER_NAME = "Events";
local ASYNC_FUNCTIONS_FOLDER_NAME = "AsyncFunctions";
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
local remoteFolder = findOrCreateFolder(replicatedStorage, REMOTES_FOLDER_NAME);
local functionFolder = findOrCreateFolder(remoteFolder, FUNCTIONS_FOLDER_NAME);
local eventFolder = findOrCreateFolder(remoteFolder, EVENTS_FOLDER_NAME);
local asyncFunctionFolder = findOrCreateFolder(remoteFolder, ASYNC_FUNCTIONS_FOLDER_NAME);
local function errorft(message, vars)
	message = string.gsub(message, "{([%w_][%w%d_]*)}", function(token)
		local _2 = vars[token];
		return (_2 ~= 0 and _2 == _2 and _2 ~= "" and _2) or token;
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
	elseif remoteType == "AsyncRemoteFunction" then
		targetFolder = asyncFunctionFolder;
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
		if not (IS_SERVER) then
			error("Creation of Events or Functions must be done on server!");
		end;
		local remote;
		if remoteType == "RemoteEvent" then
			remote = Instance.new("RemoteEvent");
		elseif remoteType == "AsyncRemoteFunction" then
			remote = Instance.new("RemoteEvent");
		elseif remoteType == "RemoteFunction" then
			remote = Instance.new("RemoteFunction");
		else
			error("Invalid Remote Type: " .. remoteType);
		end;
		remote.Name = name;
		remote.Parent = getRemoteFolder(remoteType);
		return remote;
	end;
end;
local function checkArguments(types, args)
	if args == nil then
		warn("[net-types] Argument length is zero");
		return false;
	end;
	do
		local i = 0;
		while i < #types do
			local typeCheck = types[i + 1];
			local value = args[i + 1];
			if not (typeCheck(value)) then
				warn("[net-types] Argument at index " .. tostring(i) .. " was invalid type.");
				return false;
			end;
			i = i + 1;
		end;
	end;
	return true;
end;
if IS_SERVER then
	game:GetService("RunService").Stepped:Connect(function(time, step)
		for _2 = 1, #ServerTickFunctions do
			local f = ServerTickFunctions[_2];
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
exports.checkArguments = checkArguments;
return exports;
