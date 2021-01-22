-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local ClientDefinitionBuilder = TS.import(script, script.Parent, "ClientDefinitionBuilder").ClientDefinitionBuilder
local ServerDefinitionBuilder = TS.import(script, script.Parent, "ServerDefinitionBuilder").ServerDefinitionBuilder
local DefinitionBuilders
do
	DefinitionBuilders = setmetatable({}, {
		__tostring = function()
			return "DefinitionBuilders"
		end,
	})
	DefinitionBuilders.__index = DefinitionBuilders
	function DefinitionBuilders.new(...)
		local self = setmetatable({}, DefinitionBuilders)
		self:constructor(...)
		return self
	end
	function DefinitionBuilders:constructor(decl)
		self.decl = decl
		self.Server = ServerDefinitionBuilder.new(self.decl)
		self.Client = ClientDefinitionBuilder.new(self.decl)
	end
	function DefinitionBuilders:GetAllClient()
		local remotes = {}
		for remoteId in pairs(self.decl) do
			remotes[remoteId] = self:GetClient(remoteId)
		end
		return remotes
	end
	function DefinitionBuilders:GetClient(k)
		warn("[rbx-net] Use 'Client.Get' instead of 'GetClient' in the DefinitionBuilder for " .. k .. "")
		return self.Client:Get(k)
	end
	function DefinitionBuilders:CreateServer(k)
		warn("[rbx-net] Use 'Server.Create' instead of 'CreateServer' in the DefinitionBuilder for " .. k .. ".")
		return self.Server:Create(k)
	end
	function DefinitionBuilders:CreateAllServer()
		local remotes = {}
		for remoteId in pairs(self.decl) do
			remotes[remoteId] = self:CreateServer(remoteId)
		end
		return remotes
	end
end
local function CreateNetDefinitionBuilder(remotes)
	return DefinitionBuilders.new(remotes)
end
return {
	default = CreateNetDefinitionBuilder,
}
