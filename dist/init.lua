-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.TS.RuntimeLib)
local NetServerContext = TS.import(script, script, "server")
local NetClientContext = TS.import(script, script, "client")
local NetDefinitions = TS.import(script, script, "definitions").default
local NetMiddlewares = TS.import(script, script, "middleware").NetMiddlewares
local NetSerialization = TS.import(script, script, "serializer")
local BUILD_TYPE = "Luau"
--[[
	*
	* Networking Library for Roblox
	* @version 2.0
]]
local Net = {}
do
	local _0 = Net
	--[[
		*
		* All Net functions and classes relating to the client
	]]
	local Client = NetClientContext
	_0.Client = Client
	--[[
		*
		* All Net functions and classes relating to the server
	]]
	local Server = NetServerContext
	_0.Server = Server
	--[[
		*
		* @experimental
		* Experimental definition builder for Net
	]]
	local Definitions = NetDefinitions
	_0.Definitions = Definitions
	--[[
		*
		* The version of RbxNet
	]]
	local VERSION = "2.0.0-rc.1" .. " (" .. ("production" == "development" and "DEV " .. BUILD_TYPE or BUILD_TYPE) .. ")"
	_0.VERSION = VERSION
	--[[
		*
		* Built-in middlewares
	]]
	local Middleware = NetMiddlewares
	_0.Middleware = Middleware
	--[[
		*
		* Middleware function type for Net
	]]
	--[[
		*
		* Network serialization namespace
		* @internal Still in development
	]]
	local Serialization = NetSerialization
	_0.Serialization = Serialization
	--[[
		*
		* An object that contains a `Serialize` method.
		* @internal Still in development
	]]
	--[[
		*
		* A serialized representation of the object
		* @internal Still in development
	]]
end
return Net
