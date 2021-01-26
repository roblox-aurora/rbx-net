-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.TS.RuntimeLib)
local HttpService = game:GetService("HttpService")
local runService = game:GetService("RunService")
local collectionService = game:GetService("CollectionService")
-- * @internal
local IS_SERVER = not runService:IsRunning() or runService:IsServer()
-- * @internal
local IS_CLIENT = runService:IsRunning() and runService:IsClient()
local IS_RUNNING = runService:IsRunning()
-- * @internal
local MAX_CLIENT_WAITFORCHILD_TIMEOUT = 10
-- * @internal
local function getGlobalRemote(name)
	return ":\\" .. name
end
-- * @internal
local function isLuaTable(value)
	local _0 = value
	return type(_0) == "table"
end
local REMOTES_FOLDER_NAME = "_NetManaged"
-- * @internal
-- * @internal
local ServerTickFunctions = {}
-- * @internal
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
-- const dist = $env<"TS" | "Luau" | "TestTS">("TYPE", "TS");
local location = script.Parent
local remoteFolder = findOrCreateFolder(location, REMOTES_FOLDER_NAME)
--[[
	*
	* Errors with variables formatted in a message
	* @param message The message
	* @param vars variables to pass to the error message
]]
local function errorft(message, vars)
	-- eslint-disable-next-line @typescript-eslint/ban-ts-comment
	-- @ts-ignore
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
local function format(message, vars)
	-- eslint-disable-next-line @typescript-eslint/ban-ts-comment
	-- @ts-ignore
	local _0 = message
	local _1 = function(token)
		local _2 = vars[token]
		if not (_2 ~= 0 and _2 == _2 and _2 ~= "" and _2) then
			_2 = token
		end
		return _2
	end
	message = string.gsub(_0, "{([%w_][%w%d_]*)}", _1)
	return message
end
-- * @internal
local findRemote
local function waitForRemote(remoteType, name, timeout)
	return TS.Promise.defer(function(resolve, reject)
		local i = 0
		local result
		repeat
			do
				local step = runService.Heartbeat:Wait()
				i += step
				result = findRemote(remoteType, name)
			end
		until not (i < timeout and not result)
		if result then
			resolve(result)
		else
			reject("Unable to find remote object")
		end
	end)
end
-- * @internal
function findRemote(remoteType, name)
	if remoteType == "AsyncRemoteFunction" then
		local _0 = collectionService:GetTagged("NetManagedAsyncFunction")
		local _1 = function(f)
			return f.Name == name
		end
		-- ▼ ReadonlyArray.find ▼
		local _2 = nil
		for _3, _4 in ipairs(_0) do
			if _1(_4, _3 - 1, _0) == true then
				_2 = _4
				break
			end
		end
		-- ▲ ReadonlyArray.find ▲
		return _2
	elseif remoteType == "RemoteEvent" then
		local _0 = collectionService:GetTagged("NetManagedEvent")
		local _1 = function(f)
			return f.Name == name
		end
		-- ▼ ReadonlyArray.find ▼
		local _2 = nil
		for _3, _4 in ipairs(_0) do
			if _1(_4, _3 - 1, _0) == true then
				_2 = _4
				break
			end
		end
		-- ▲ ReadonlyArray.find ▲
		return _2
	elseif remoteType == "RemoteFunction" then
		local _0 = collectionService:GetTagged("NetManagedLegacyFunction")
		local _1 = function(f)
			return f.Name == name
		end
		-- ▼ ReadonlyArray.find ▼
		local _2 = nil
		for _3, _4 in ipairs(_0) do
			if _1(_4, _3 - 1, _0) == true then
				_2 = _4
				break
			end
		end
		-- ▲ ReadonlyArray.find ▲
		return _2
	end
	error("Invalid Remote Access")
end
-- * @internal
local function getRemoteOrThrow(remoteType, name)
	local existing = findRemote(remoteType, name)
	if existing then
		return existing
	else
		error("Could not find Remote of type " .. remoteType .. ' called "' .. name .. '"')
	end
end
-- * @internal
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
			collectionService:AddTag(remote, "NetManagedEvent")
		elseif remoteType == "AsyncRemoteFunction" then
			remote = Instance.new("RemoteEvent")
			collectionService:AddTag(remote, "NetManagedAsyncFunction")
		elseif remoteType == "RemoteFunction" then
			remote = Instance.new("RemoteFunction")
			collectionService:AddTag(remote, "NetManagedLegacyFunction")
		else
			error("Invalid Remote Type: " .. remoteType)
		end
		remote.Name = name
		remote.Parent = remoteFolder
		return remote
	end
end
-- * @internal
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
	format = format,
	waitForRemote = waitForRemote,
	findRemote = findRemote,
	getRemoteOrThrow = getRemoteOrThrow,
	findOrCreateRemote = findOrCreateRemote,
	checkArguments = checkArguments,
	IS_SERVER = IS_SERVER,
	IS_CLIENT = IS_CLIENT,
	IS_RUNNING = IS_RUNNING,
	MAX_CLIENT_WAITFORCHILD_TIMEOUT = MAX_CLIENT_WAITFORCHILD_TIMEOUT,
	ServerTickFunctions = ServerTickFunctions,
}
