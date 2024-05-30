--!strict
--[[
    Luau entry-point for RbxNet
]]
local TS = require(script.TS.RuntimeLib)
local NetServerContext = TS.import(script, script, "server")
local NetClientContext = TS.import(script, script, "client")
local NetDefinitions = TS.import(script, script, "definitions").default
local NetMiddleware = TS.import(script, script, "middleware").NetMiddleware
export type ServerToClientEventDefinition = {
	__nominal_ServerToClientEventDefinition: nil,
}
export type ClientToServerEventDefinition = {
	__nominal_ClientToServerEventDefinition: nil,
}
export type ServerFunctionDefinition = {
	__nominal_ServerFunctionDefinition: nil,
}
export type ServerAsyncFunctionDefinition = {
	__nominal_ServerAsyncFunctionDefinition: nil,
}
export type ClientAsyncFunctionDefinition = {
	__nominal_ClientAsyncFunctionDefinition: nil,
}

type Sender = {}
type RemoteLike = {}
type Array<T> = { T }
type CheckLike = (value: any) -> boolean

--- Middleware --

type NetManagedInstance = {
	GetInstance: (self: NetManagedInstance) -> RemoteLike,
}

export type NetMiddleware<CallArguments = { any }, PreviousCallArguments = { any }> = (
	next: (player: Sender, ...CallArguments) -> (),
	instance: NetManagedInstance
) -> (sender: Sender, ...any) -> ()

export type RateLimitError = {
	Message: string,
	UserId: number,
	RemoteId: string,
	MaxRequestsPerMinute: number,
}

export type RateLimitMiddlewareOptions = {
	MaxRequestsPerMinute: number,
	ThrottleMessage: string?,
	ErrorHandler: ((rateLimitError: RateLimitError) -> ())?,
}
export type LoggingMiddlewareOptions = {}

type NetNamespaceMiddleware = {
	TypeChecking: (...CheckLike) -> NetMiddleware<any, any>,
	RateLimit: (opts: RateLimitMiddlewareOptions) -> NetMiddleware<any, any>,
	Logging: (opts: LoggingMiddlewareOptions?) -> NetMiddleware<any, any>,
}

--- Client Signals --
export type ClientListenerEvent = {
	Connect: (self: ClientListenerEvent, ...any) -> RBXScriptConnection,
}

export type ClientSenderEvent = {
	SendToServer: (self: ClientSenderEvent, ...any) -> (),
}

export type ClientAsyncCallback = {
	SetCallback: (self: ClientAsyncCallback, callback: (...any) -> any) -> (),
}

export type ClientAsyncCaller = {
	CallServerAsync: (self: ClientAsyncCaller, ...any) -> Promise,
	SetCallTimeout: (self: ClientAsyncCallback, timeout: number) -> (),
	GetCallTimeout: (self: ClientAsyncCallback) -> (),
}

export type ClientCaller = {
	CallServer: (self: ClientCaller, ...any) -> (),
}

-- Server Signals ---
export type ServerListenerEvent = {
	Connect: (self: ServerListenerEvent, ...any) -> RBXScriptConnection,
}

export type ServerSenderEvent = {
	SendToAllPlayers: (self: ServerSenderEvent, ...any) -> (),
	SendToPlayer: (self: ServerSenderEvent, player: Player, ...any) -> (),
	SendToPlayers: (self: ServerSenderEvent, players: { Player }, ...any) -> (),
	SendToAllPlayersExcept: (self: ServerSenderEvent, blacklist: Player | { Player }, ...any) -> (),
}

export type ServerAsyncCallback = {
	SetCallback: (self: ServerAsyncCallback, callback: (player: Player, ...any) -> any) -> (),
}

export type ServerAsyncCaller = {
	CallPlayerAsync: (self: ServerAsyncCaller, player: Player, ...any) -> Promise,
	SetCallTimeout: (self: ServerAsyncCaller, timeout: number) -> (),
	GetCallTimeout: (self: ServerAsyncCaller) -> number,
}

--- Definitions ---

type RemoteDefinition =
	ServerToClientEventDefinition
	| ClientToServerEventDefinition
	| ServerFunctionDefinition
	| ServerAsyncFunctionDefinition
	| ClientAsyncFunctionDefinition

export type RemoteDefinitions = { [string]: RemoteDefinition | { RemoteDefinition } }

type NetNamespaceDefinitions = {
	Namespace: (
		definitions: {
			[string]: ServerToClientEventDefinition
				| ClientToServerEventDefinition
				| ServerAsyncFunctionDefinition
				| ClientAsyncFunctionDefinition,
		}
	) -> { RemoteDefinition },
	ServerToClientEvent: () -> ServerToClientEventDefinition,
	ClientToServerEvent: (mw: Array<NetMiddleware>?) -> ClientToServerEventDefinition,
	ServerFunction: (mw: Array<NetMiddleware>?) -> ServerFunctionDefinition,
	ServerAsyncFunction: (mw: Array<NetMiddleware>?) -> ServerAsyncFunctionDefinition,
	ClientAsyncFunction: () -> ClientAsyncFunctionDefinition,
}

type NetServerDefinition = {
	Get: (
		self: NetServerDefinition,
		id: string
	) -> ServerSenderEvent | ServerListenerEvent | ServerAsyncCallback | ServerAsyncCaller,
	GetNamespace: (self: NetServerDefinition, group: string) -> NetServerDefinition,
	OnFunction: (self: NetServerDefinition, functionId: string, callback: (Player, ...unknown) -> unknown) -> (),
	OnEvent: (self: NetServerDefinition, eventId: string, callback: (Player, ...unknown) -> ()) -> (),
}

type NetClientDefinition = {
	Get: (
		self: NetClientDefinition,
		id: string
	) -> ClientSenderEvent | ClientListenerEvent | ClientAsyncCallback | ClientAsyncCaller | ClientCaller,
	GetNamespace: (self: NetClientDefinition, group: string) -> NetClientDefinition,
	OnFunction: (self: NetClientDefinition, functionId: string, callback: (...unknown) -> unknown) -> (),
	OnEvent: (self: NetClientDefinition, eventId: string, callback: (...unknown) -> ()) -> (),
}

export type NetDefinition = {
	Server: NetServerDefinition,
	Client: NetClientDefinition,
}

export type Net = {
	CreateDefinitions: (definitions: RemoteDefinitions) -> NetDefinition,
	Definitions: NetNamespaceDefinitions,
	Middleware: NetNamespaceMiddleware,
}

local Net = {
	CreateDefinitions = function(declarations, configuration)
		return NetDefinitions.Create(declarations, configuration)
	end,
	Middleware = NetMiddleware,
	Definitions = NetDefinitions,
	DIST = "Luau",
} :: Net

return Net
