-- Compiled with roblox-ts v1.1.1
local TS = require(script.Parent.TS.RuntimeLib)
-- eslint-disable @typescript-eslint/no-explicit-any
local DeclarationTypeCheck = TS.import(script, script, "Types").DeclarationTypeCheck
local ServerDefinitionBuilder = TS.import(script, script, "ServerDefinitionBuilder").ServerDefinitionBuilder
local ClientDefinitionBuilder = TS.import(script, script, "ClientDefinitionBuilder").ClientDefinitionBuilder
local warnOnce = TS.import(script, script.Parent, "internal").warnOnce
local NamespaceBuilder = TS.import(script, script, "NamespaceBuilder").NamespaceBuilder
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
			local _1 = DeclarationTypeCheck.check(declaration.Type)
			local _2 = DeclarationTypeCheck.errorMessage
			assert(_1, _2)
		end
	end
	--[[
		*
		* Creates definitions for Remote instances that can be used on both the client and server.
		* @description https://docs.vorlias.com/rbx-net/docs/2.0/definitions#definitions-oh-my
		* @param declarations
	]]
	local function Create(declarations, globalMiddleware)
		validateDeclarations(declarations)
		local _1 = {
			Server = ServerDefinitionBuilder.new(declarations, globalMiddleware),
			Client = ClientDefinitionBuilder.new(declarations),
		}
		return _1
	end
	_0.Create = Create
	--[[
		*
		* Defines a namespace of remote definitions, which can be retrieved via `GetNamespace(namespaceId)`
		*
		* E.g.
		* ```ts
		* const Remotes = Net.Definitions.Create({
		* 		ExampleGroup: Net.Definitions.Namespace({
		* 			ExampleGroupRemote: Net.Definitions.ServerToClientEvent<[message: string]>(),
		* 		}),
		* });
		* const ExampleGroupRemote = Remotes.Server.GetNamespace("ExampleGroup").Create("ExampleGroupRemote");
		* ```
		*
		* This is useful for categorizing remotes by feature.
	]]
	local function Namespace(declarations)
		return {
			Type = "Namespace",
			Definitions = NamespaceBuilder.new(declarations),
		}
	end
	_0.Namespace = Namespace
	--[[
		*
		* Defines a function in which strictly the client can call the server asynchronously
		*
		* `Client` [`Calls`] -> `Server` [`Recieves Call`]
		* ... (asynchronously) ...
		* `Server` [`Responds to Call`] -> `Client` [`Recieves Response`]
	]]
	local function ServerAsyncFunction(mw)
		return {
			Type = "AsyncFunction",
			ServerMiddleware = mw,
		}
	end
	_0.ServerAsyncFunction = ServerAsyncFunction
	--[[
		*
		* Defines a function in which strictly the server can call the client asynchronously
		*
		* `Server` [`Calls`] -> `Client` [`Recieves Call`]
		* ... (asynchronously) ...
		* `Client` [`Responds to Call`] -> `Server` [`Recieves Response`]
	]]
	local function ClientAsyncFunction()
		return {
			Type = "AsyncFunction",
		}
	end
	_0.ClientAsyncFunction = ClientAsyncFunction
	--[[
		*
		* Defines a regular function in which strictly the client can call the server synchronously
		*
		* (Synchronous) `Client` [`Calls`, `Recieves Response`] <- (yields for response) -> `Server` [`Recieves Call`, `Responds`]
	]]
	local function ServerFunction(mw)
		return {
			Type = "Function",
			ServerMiddleware = mw,
		}
	end
	_0.ServerFunction = ServerFunction
	--[[
		*
		* Defines an event in which strictly the server fires an event that is recieved by clients
		*
		* `Server` [`Sends`] => `Client(s)` [`Recieves`]
		*
		* On the client, this will give an event that can use `Connect`.
		*
		* On the server, this will give an event that can use `SendToPlayer`, `SendToAllPlayers`, `SendToAllPlayersExcept`
		*
	]]
	local function ServerToClientEvent()
		return {
			ServerMiddleware = {},
			Type = "Event",
		}
	end
	_0.ServerToClientEvent = ServerToClientEvent
	--[[
		*
		* Defines an event in which strictly clients fire an event that's recieved by the server
		*
		* `Client(s)` [`Sends`] => `Server` [`Recieves`]
		*
		* On the client, this will give an event that can use `SendToServer`.
		*
		* On the server, this will give an event that can use `Connect`.
		*
		* @param mw The middleware of this event.
	]]
	local function ClientToServerEvent(mw)
		return {
			Type = "Event",
			ServerMiddleware = mw,
		}
	end
	_0.ClientToServerEvent = ClientToServerEvent
	--[[
		*
		* Defines a remote event that can be fired both from the client and server
		*
		* This should only be required in rare use cases where `ClientToServerEvent` or `ServerToClientEvent` is not sufficient.
	]]
	local function BidirectionalEvent()
		return {
			Type = "Event",
			ServerMiddleware = {},
		}
	end
	_0.BidirectionalEvent = BidirectionalEvent
	-- / REGION deprecated members
	--[[
		*
		* Creates a definition for a function
		* @deprecated
	]]
	local function Function(mw)
		warnOnce("Definition '" .. "Function" .. "' is deprecated, use '" .. "ServerFunction" .. "' in your declarations - https://github.com/roblox-aurora/rbx-net/issues/35")
		return {
			Type = "Function",
			ServerMiddleware = mw,
		}
	end
	_0.Function = Function
	--[[
		*
		* Creates a definition for an event
		*
		*
		* ### If the event is fired by the client to the server, use `ClientToServerEvent`.
		* ### If the event is fired by the server to the client, use `ServerToClientEvent`.
		* ### If the event is both fired by client and server, use `BidirectionalEvent`.
		*
		* @deprecated This will be removed in future - please redesign your definitions
		*
	]]
	local function Event(mw)
		warnOnce("Definition '" .. "Event" .. "' is deprecated, use '" .. "ServerToClientEvent" .. "', '" .. "ClientToServerEvent" .. "' or '" .. "BidirectionalEvent" .. "' in your declarations - https://github.com/roblox-aurora/rbx-net/issues/35")
		return {
			Type = "Event",
			ServerMiddleware = mw,
		}
	end
	_0.Event = Event
	--[[
		*
		* Creates a definition for an async function
		*
		* ### If the function callback is on the server, use `AsyncServerFunction`.
		* ### If the function callback is on the client, use `AsyncClientFunction`.
		*
		* @deprecated This will be removed in future - please redesign your definitions
	]]
	local function AsyncFunction(mw)
		warnOnce("Definition '" .. "AsyncFunction" .. "' is deprecated, use '" .. "ServerAsyncFunction" .. "' or '" .. "ClientAsyncFunction" .. "' in your declarations - https://github.com/roblox-aurora/rbx-net/issues/35")
		return {
			Type = "AsyncFunction",
			ServerMiddleware = mw,
		}
	end
	_0.AsyncFunction = AsyncFunction
end
local default = NetDefinitions
return {
	default = default,
}
