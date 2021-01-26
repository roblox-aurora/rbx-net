-- Compiled with roblox-ts v1.0.0-beta.15
local TS = require(script.Parent.TS.RuntimeLib)
-- eslint-disable @typescript-eslint/no-explicit-any
local _NetDefinitionBuilders = TS.import(script, script, "CreateDefinitions")._NetDefinitionBuilders
local oneOf = TS.import(script, script.Parent, "helpers", "validator").oneOf
local declarationType = oneOf("Event", "Function", "AsyncFunction")
local NetDefinitions = {}
do
	local _0 = NetDefinitions
	--[[
		*
		* Validates the specified declarations to ensure they're valid before usage
		* @param declarations The declarations
	]]
	local function validateDeclarations(declarations)
		for _, declaration in pairs(declarations) do
			local _1 = declarationType.check(declaration.Type)
			local _2 = declarationType.errorMessage
			assert(_1, _2)
		end
	end
	--[[
		*
		* Creates definitions for Remote instances that can be used on both the client and server.
		*
		*
		*
		* @description https://docs.vorlias.com/rbx-net/docs/2.0/definitions#definitions-oh-my
		* @param declarations
	]]
	local function Create(declarations)
		validateDeclarations(declarations)
		return _NetDefinitionBuilders.new(declarations)
	end
	_0.Create = Create
	--[[
		*
		* Creates a definition for an async function
	]]
	local function AsyncFunction(mw)
		return {
			Type = "AsyncFunction",
			ServerMiddleware = mw,
		}
	end
	_0.AsyncFunction = AsyncFunction
	--[[
		*
		* Creates a definition for a function
	]]
	local function Function(mw)
		return {
			Type = "Function",
			ServerMiddleware = mw,
		}
	end
	_0.Function = Function
	--[[
		*
		* Creates a definition for an event
	]]
	local function Event(mw)
		return {
			Type = "Event",
			ServerMiddleware = mw,
		}
	end
	_0.Event = Event
end
local default = NetDefinitions
return {
	default = default,
}
