-- Compiled with roblox-ts v1.0.0-beta.14
local TS = require(script.Parent.Parent.TS.RuntimeLib)
local ClientEvent = TS.import(script, script.Parent.Parent, "client", "ClientEvent").default
local function isMiddlewareArgument(args)
	local _0 = #args > 1
	if _0 then
		local _1 = args[1]
		_0 = type(_1) == "table"
	end
	return _0
end
local function createClientListener(id, ...)
	local args = { ... }
	local event
	if isMiddlewareArgument(args) then
		error("No Middleware")
	else
		local _0 = args
		local connect = _0[1]
		event = ClientEvent.new(id)
		return event:Connect(connect)
	end
end
return {
	default = createClientListener,
}
