
local TS = _G[script]
local _0 = TS.import(script, script.Parent, "internal")
local findOrCreateRemote = _0.findOrCreateRemote
local IS_CLIENT = _0.IS_CLIENT
local checkArguments = _0.checkArguments
local errorft = _0.errorft
local throttler = TS.import(script, script.Parent, "Throttle")
local GetConfiguration = TS.import(script, script.Parent, "configuration").GetConfiguration
local UNLIMITED_REQUESTS = -1
--[[
	*
	* A function on the server
	* @rbxts server
]]
local NetServerFunction
do
	NetServerFunction = setmetatable({}, {
		__tostring = function()
			return "NetServerFunction"
		end,
	})
	NetServerFunction.__index = NetServerFunction
	function NetServerFunction.new(...)
		local self = setmetatable({}, NetServerFunction)
		self:constructor(...)
		return self
	end
	function NetServerFunction:constructor(name, ...)
		local recievedPropTypes = { ... }
		self.invalidRequestHandler = GetConfiguration("InvalidPropTypesHandler")
		self.maxRequestsPerMinute = UNLIMITED_REQUESTS
		self.instance = findOrCreateRemote("RemoteFunction", name)
		assert(not IS_CLIENT, "Cannot create a Net.ServerFunction on the Client!")
		self.clientRequests = throttler:Get("Function~" .. name)
		if #recievedPropTypes > 0 then
			self.propTypes = recievedPropTypes
		end
	end
	function NetServerFunction:Unmanaged(name)
		return findOrCreateRemote("RemoteFunction", name)
	end
	function NetServerFunction:GetCallback()
		return self.instance.OnServerInvoke
	end
	function NetServerFunction:SetCallback(func)
		if self.propTypes ~= nil then
			self.instance.OnServerInvoke = function(player, ...)
				local args = { ... }
				local maxRequests = self.maxRequestsPerMinute
				
				if maxRequests > 0 then
					local clientRequestCount = self.clientRequests:Get(player)
					if clientRequestCount >= maxRequests then
						errorft(GetConfiguration("ServerThrottleMessage"), {
							player = player.UserId,
							remote = self.instance.Name,
							limit = maxRequests,
						})
					else
						self.clientRequests:Increment(player)
					end
				end
				if checkArguments(self.propTypes, args) then
					return func(player, unpack(args))
				else
					
					local _1 = self.invalidRequestHandler
					if _1 ~= 0 and _1 == _1 and _1 ~= "" and _1 then
						_1 = self.invalidRequestHandler(self, player)
					end
					error("Client failed type checks", 2)
				end
			end
		else
			self.instance.OnServerInvoke = func
		end
		return self
	end
	function NetServerFunction:GetInstance()
		return self.instance
	end
	function NetServerFunction:GetClientCache()
		local cache = self.instance:FindFirstChild("Cache")
		if cache then
			return cache.Value
		else
			return 0
		end
	end
	function NetServerFunction:SetClientCache(time)
		local cache = self.instance:FindFirstChild("Cache")
		if not cache then
			local cacheTimer = Instance.new("NumberValue", self.instance)
			cacheTimer.Value = time
			cacheTimer.Name = "Cache"
		else
			cache.Value = time
		end
		return self
	end
	function NetServerFunction:SetRateLimit(requestsPerMinute)
		self.maxRequestsPerMinute = requestsPerMinute
		local clientValue = self.instance:FindFirstChild("RateLimit")
		if clientValue then
			clientValue.Value = requestsPerMinute
		else
			clientValue = Instance.new("IntValue", self.instance)
			clientValue.Name = "RateLimit"
			clientValue.Value = requestsPerMinute
		end
	end
	function NetServerFunction:GetRateLimit()
		return self.maxRequestsPerMinute
	end
end
return {
	default = NetServerFunction,
}
