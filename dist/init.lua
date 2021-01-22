-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.TS.RuntimeLib)
local NetServerContext = TS.import(script, script, "server")
local NetClientContext = TS.import(script, script, "client")
local CreateNetDefinitionBuilder = TS.import(script, script, "definitions").default
local NetMiddlewares = TS.import(script, script, "middleware").NetMiddlewares
local BUILD_TYPE = "Luau"
local Net = {}
do
	local _0 = Net
	local Client = NetClientContext
	_0.Client = Client
	local Server = NetServerContext
	_0.Server = Server
	local Definitions = CreateNetDefinitionBuilder
	_0.Definitions = Definitions
	local VERSION = "2.0.0-rc.0" .. " (" .. ("production" == "development" and "DEV " .. BUILD_TYPE or BUILD_TYPE) .. ")"
	_0.VERSION = VERSION
	local Middleware = NetMiddlewares
	_0.Middleware = Middleware
end
return Net
