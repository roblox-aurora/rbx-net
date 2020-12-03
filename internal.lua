
local replicatedStorage = game:GetService("ReplicatedStorage")
local runService = game:GetService("RunService")

local IS_SERVER = runService:IsServer()

local IS_CLIENT = (__LEMUR__ and not runService:IsServer()) or runService:IsClient()

local MAX_CLIENT_WAITFORCHILD_TIMEOUT = 10

local function getGlobalRemote(name)
	return "$" .. name
end

local function isLuaTable(value)
	local _0 = value
	return type(_0) == "table"
end
local REMOTES_FOLDER_NAME = "Remotes"
local FUNCTIONS_FOLDER_NAME = "Functions"
local EVENTS_FOLDER_NAME = "Events"
local ASYNC_FUNCTIONS_FOLDER_NAME = "AsyncFunctions"

local ServerTickFunctions = {}

local function findOrCreateFolder(parent, name)
	local folder = parent:FindFirstChild(name)
	if folder then
		return folder
	else
		folder = Instance.new("Folder", parent)
		folder.Name = name
		return folder
	end
end
local remoteFolder = findOrCreateFolder(replicatedStorage, REMOTES_FOLDER_NAME)
local functionFolder = findOrCreateFolder(remoteFolder, FUNCTIONS_FOLDER_NAME)
local eventFolder = findOrCreateFolder(remoteFolder, EVENTS_FOLDER_NAME)
local asyncFunctionFolder = findOrCreateFolder(remoteFolder, ASYNC_FUNCTIONS_FOLDER_NAME)
--[[
	*
	* Errors with variables formatted in a message
	* @param message The message
	* @param vars variables to pass to the error message
]]
local function errorft(message, vars)
	
	
	local _0 = message
	local _1 = function(token)
		local _2 = vars[token]
		if not (_2 ~= 0 and _2 == _2 and _2 ~= "" and _2) then
			_2 = token
		end
		return _2
	end
	message = string.gsub(_0, "{([%w_][%w%d_]*)}", _1)
	error(message, 2)
end

local function eventExists(name)
	return eventFolder:FindFirstChild(name) ~= nil
end

local function functionExists(name)
	return functionFolder:FindFirstChild(name) ~= nil
end

local function waitForEvent(name, timeOut)
	return eventFolder:WaitForChild(name, timeOut)
end

local function waitForFunction(name, timeOut)
	return functionFolder:WaitForChild(name, timeOut)
end

local function getRemoteFolder(remoteType)
	local targetFolder
	if remoteType == "RemoteEvent" then
		targetFolder = eventFolder
	elseif remoteType == "RemoteFunction" then
		targetFolder = functionFolder
	elseif remoteType == "AsyncRemoteFunction" then
		targetFolder = asyncFunctionFolder
	else
		return error("Invalid type: " .. remoteType)
	end
	return targetFolder
end

local function findRemote(remoteType, name)
	local targetFolder = getRemoteFolder(remoteType)
	local existing = targetFolder:FindFirstChild(name)
	return existing
end

local function getRemoteOrThrow(remoteType, name)
	local existing = findRemote(remoteType, name)
	if existing then
		return existing
	else
		error("Could not find Remote of type " .. remoteType .. ' called "' .. name .. '"')
	end
end

local function findOrCreateRemote(remoteType, name)
	local existing = findRemote(remoteType, name)
	if existing then
		return existing
	else
		if not IS_SERVER then
			error("Creation of Events or Functions must be done on server!")
		end
		local remote
		if remoteType == "RemoteEvent" then
			remote = Instance.new("RemoteEvent")
		elseif remoteType == "AsyncRemoteFunction" then
			remote = Instance.new("RemoteEvent")
		elseif remoteType == "RemoteFunction" then
			remote = Instance.new("RemoteFunction")
		else
			error("Invalid Remote Type: " .. remoteType)
		end
		remote.Name = name
		remote.Parent = getRemoteFolder(remoteType)
		return remote
	end
end
local function checkArguments(types, args)
	if args == nil then
		warn("[net-types] Argument length is zero")
		return false
	end
	do
		local _0 = 0
		while _0 < #types do
			local i = _0
			local typeCheck = types[i + 1]
			local value = args[i + 1]
			if not typeCheck(value) then
				warn("[net-types] Argument at index " .. tostring(i) .. " was invalid type.")
				return false
			end
			_0 = i
			_0 += 1
		end
	end
	return true
end
if IS_SERVER then
	game:GetService("RunService").Stepped:Connect(function(time, step)
		for _, f in ipairs(ServerTickFunctions) do
			f()
		end
	end)
end
return {
	getGlobalRemote = getGlobalRemote,
	isLuaTable = isLuaTable,
	findOrCreateFolder = findOrCreateFolder,
	errorft = errorft,
	eventExists = eventExists,
	functionExists = functionExists,
	waitForEvent = waitForEvent,
	waitForFunction = waitForFunction,
	getRemoteFolder = getRemoteFolder,
	findRemote = findRemote,
	getRemoteOrThrow = getRemoteOrThrow,
	findOrCreateRemote = findOrCreateRemote,
	checkArguments = checkArguments,
	IS_SERVER = IS_SERVER,
	IS_CLIENT = IS_CLIENT,
	MAX_CLIENT_WAITFORCHILD_TIMEOUT = MAX_CLIENT_WAITFORCHILD_TIMEOUT,
	ServerTickFunctions = ServerTickFunctions,
}
