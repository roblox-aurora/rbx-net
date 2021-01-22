-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local _0 = TS.import(script, script.Parent.Parent, "internal")
local findOrCreateRemote = _0.findOrCreateRemote
local IS_CLIENT = _0.IS_CLIENT
local IS_RUNNING = _0.IS_RUNNING
local MiddlewareEvent = TS.import(script, script.Parent, "MiddlewareEvent").default
local ServerEvent
do
	local super = MiddlewareEvent
	ServerEvent = setmetatable({}, {
		__tostring = function()
			return "ServerEvent"
		end,
		__index = super,
	})
	ServerEvent.__index = ServerEvent
	function ServerEvent.new(...)
		local self = setmetatable({}, ServerEvent)
		self:constructor(...)
		return self
	end
	function ServerEvent:constructor(name, middlewares)
		if middlewares == nil then
			middlewares = {}
		end
		super.constructor(self, middlewares)
		self.instance = findOrCreateRemote("RemoteEvent", name)
		local _1 = not IS_CLIENT
		assert(_1, "Cannot create a NetServerEvent on the client!")
	end
	function ServerEvent:GetInstance()
		return self.instance
	end
	function ServerEvent:Connect(callback)
		local connection = self.instance.OnServerEvent:Connect(function(player, ...)
			local args = { ... }
			local _1 = self:_processMiddleware(callback)
			if _1 ~= nil then
				_1(player, unpack(args))
			end
		end)
		return connection
	end
	function ServerEvent:SendToAllPlayers(...)
		local args = { ... }
		if not IS_RUNNING then
			return nil
		end
		self.instance:FireAllClients(unpack(args))
	end
	function ServerEvent:SendToAllPlayersExcept(blacklist, ...)
		local args = { ... }
		if not IS_RUNNING then
			return nil
		end
		local Players = game:GetService("Players")
		local _1 = blacklist
		local _2 = blacklist
		if typeof(_1) == "Instance" then
			local _3 = Players:GetPlayers()
			local _4 = function(p)
				return p ~= blacklist
			end
			-- ▼ ReadonlyArray.filter ▼
			local _5 = {}
			local _6 = 0
			for _7, _8 in ipairs(_3) do
				if _4(_8, _7 - 1, _3) == true then
					_6 += 1
					_5[_6] = _8
				end
			end
			-- ▲ ReadonlyArray.filter ▲
			local otherPlayers = _5
			for _, player in ipairs(otherPlayers) do
				self.instance:FireClient(player, unpack(args))
			end
		elseif type(_2) == "table" then
			for _, player in ipairs(Players:GetPlayers()) do
				local _3 = blacklist
				local _4 = player
				if (table.find(_3, _4) or 0) - 1 == -1 then
					self.instance:FireClient(player, unpack(args))
				end
			end
		end
	end
	function ServerEvent:SendToPlayer(player, ...)
		local args = { ... }
		if not IS_RUNNING then
			return nil
		end
		self.instance:FireClient(player, unpack(args))
	end
	function ServerEvent:SendToPlayers(players, ...)
		local args = { ... }
		if not IS_RUNNING then
			return nil
		end
		for _, player in ipairs(players) do
			self:SendToPlayer(player, unpack(args))
		end
	end
end
return {
	default = ServerEvent,
}
