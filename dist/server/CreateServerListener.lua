-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local ServerEventV2 = TS.import(script, script.Parent, "ServerEvent").default
local function isMiddlewareArgument(args)
	local _0 = #args > 1
	if _0 then
		local _1 = args[1]
		_0 = type(_1) == "table"
	end
	return _0
end
--[[
	*
	* Creates a server listening event
]]
local function createServerListener(id, ...)
	local args = { ... }
	local event
	if isMiddlewareArgument(args) then
		local _0 = args
		local middleware = _0[1]
		local connect = _0[2]
		event = ServerEventV2.new(id, middleware)
		return event:Connect(connect)
	else
		local _0 = args
		local connect = _0[1]
		event = ServerEventV2.new(id)
		return event:Connect(connect)
	end
end
return {
	default = createServerListener,
}
