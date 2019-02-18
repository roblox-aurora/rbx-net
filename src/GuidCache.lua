local guidCache = {
	cache = {},
	enabled = false
}

local runService = game:GetService("RunService")
local httpService = game:GetService("HttpService")
local guidGetAll
if (runService:IsServer()) then
	guidGetAll = Instance.new("RemoteFunction", script)
	guidGetAll.Name = "GetGuidList"
else
	guidGetAll = script:FindFirstChild("GetGuidList")
end

function guidCache:GetIds()
	if runService:IsClient() then
		return guidGetAll:InvokeServer()
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
	else
		id = httpService:GenerateGUID(false)
		self.cache[name] = id
		return id
	end
end

return guidCache
