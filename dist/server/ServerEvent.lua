-- Compiled with roblox-ts v1.1.1
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local _0 = TS.import(script, script.Parent.Parent, "internal")
local findOrCreateRemote = _0.findOrCreateRemote
local IS_CLIENT = _0.IS_CLIENT
local IS_RUNNING = _0.IS_RUNNING
local MiddlewareEvent = TS.import(script, script.Parent, "MiddlewareEvent").default
--[[
	*
	* Interface for server listening events
]]
--[[
	*
	* Interface for server sender events
]]
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
		if typeof(_1) == "Instance" then
			local _2 = Players:GetPlayers()
			local _3 = function(p)
				return p ~= blacklist
			end
			-- ▼ ReadonlyArray.filter ▼
			local _4 = {}
			local _5 = 0
			for _6, _7 in ipairs(_2) do
				if _3(_7, _6 - 1, _2) == true then
					_5 += 1
					_4[_5] = _7
				end
			end
			-- ▲ ReadonlyArray.filter ▲
			local otherPlayers = _4
			for _, player in ipairs(otherPlayers) do
				self.instance:FireClient(player, unpack(args))
			end
		else
			local _2 = blacklist
			if type(_2) == "table" then
				for _, player in ipairs(Players:GetPlayers()) do
					local _3 = blacklist
					local _4 = player
					if (table.find(_3, _4) or 0) - 1 == -1 then
						self.instance:FireClient(player, unpack(args))
					end
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
