local guidCache = {
	cache = {},
	enabled = false,
	lock = false
}

local runService = game:GetService("RunService")
local httpService = game:GetService("HttpService")
local IS_SERVER = runService:IsServer()

local guidGetAll
local guidUpdated
if (runService:IsServer()) then
	guidUpdated = Instance.new("RemoteEvent", script)
	guidUpdated.Name = "GuidListUpdated"

	guidGetAll = Instance.new("RemoteFunction", script)
	guidGetAll.Name = "GetGuidList"
	guidGetAll.OnServerInvoke = function(player)
		print("[rbx-net-guid] Cache GET", player)
		return guidCache.cache
	end
else
	guidGetAll = script:FindFirstChild("GetGuidList")
	guidUpdated = script:FindFirstChild("GuidListUpdated")
end

function guidCache:Lock()
	self.lock = true
end

function guidCache:GetIds(forceRefresh)
	if runService:IsClient() then
		if #self.cache == 0 or forceRefresh then
			local cache = guidGetAll:InvokeServer()
			self.cache = cache
			return cache
		else
			return self.cache
		end
	else
		return self.cache
	end
end

function guidCache:GetCount()
	local c = 0
	for _, item in next, self.cache do
		c = c + 1
	end
	return c
end

function guidCache:SetEnabled(enabled)
	if self.lock then
		error("[rbx-net-guid] Cannot change state of GuidCache after remotes are created!", 3)
	end

	if (enabled == nil) then
		self.enabled = true
	else
		self.endabled = enabled
	end
end

function guidCache:GetIdFromName(name)
	local id = self.cache[name]
	if id then
		return id
	end
end

function guidCache:GetOrCreateIdFromName(name)
	local id = self.cache[name]
	if id then
		return id
	elseif IS_SERVER then
		id = httpService:GenerateGUID(false)
		self.cache[name] = id
		guidUpdated:FireAllClients(name, id)
		return id
	else
		error(string.format("[rbx-net-guid] Stale Cache, could not get: %s", name))
	end
end

if (not IS_SERVER) then
	guidCache.cache = guidCache:GetIds(true)
end

return guidCache
