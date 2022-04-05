--!strict
--[[
    Luau entry-point for RbxNet
]]

export type ServerToClientEventDefinition = {
    __nominal_ServerToClientEventDefinition: nil
}
export type ClientToServerEventDefinition = {
    __nominal_ClientToServerEventDefinition: nil
}
export type ServerAsyncFunctionDefinition = {
    __nominal_ServerAsyncFunctionDefinition: nil
}
export type ClientAsyncFunctionDefinition = {
    __nominal_ClientAsyncFunctionDefinition: nil
}

type Sender = {}
type RemoteLike = {}
type Array<T> = {T}
type CheckLike = (value: any) -> boolean

--- Middleware --

type NetManagedInstance = {
    GetInstance: (self: NetManagedInstance) -> RemoteLike
}

export type NetMiddleware<CallArguments = {any}, PreviousCallArguments = {any}> = (
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
    ErrorHandler: ((rateLimitError: RateLimitError) -> ())?
}
export type LoggingMiddlewareOptions = {}

type NetNamespaceMiddleware = {
    TypeChecking: (...CheckLike) -> NetMiddleware<any, any>,
    RateLimit: (opts: RateLimitMiddlewareOptions) -> NetMiddleware<any, any>,
    Logging: (opts: LoggingMiddlewareOptions?) -> NetMiddleware<any, any>
}

--- Client Signals --
export type ClientListenerEvent = {
    Connect: (self: ClientListenerEvent, ...any) -> RBXScriptConnection,
}

export type ClientSenderEvent = {
    SendToServer: (self: ClientSenderEvent, ...any) -> (),
}

export type ClientAsyncCallback = {
    SetCallback: (self: ClientAsyncCallback, callback: (...any) -> any) -> ()
}

export type ClientAsyncCaller = {
    CallServerAsync: (self: ClientAsyncCaller, ...any) -> Promise,
    SetCallTimeout: (self: ClientAsyncCallback, timeout: number) -> (),
    GetCallTimeout: (self: ClientAsyncCallback) -> ()
}

-- Server Signals ---
export type ServerListenerEvent = {
    Connect: (self: ServerListenerEvent, ...any) -> RBXScriptConnection
}

export type ServerSenderEvent = {
    SendToAllPlayers: (self: ServerSenderEvent, ...any) -> (),
    SendToPlayer: (self: ServerSenderEvent, player: Player, ...any) -> (),
    SendToPlayers: (self: ServerSenderEvent, players: {Player}, ...any) -> (),
    SendToAllPlayersExcept: (self: ServerSenderEvent, blacklist: Player | {Player}, ...any) -> ()
}

export type ServerAsyncCallback = {
    SetCallback: (self: ServerAsyncCallback, callback: (player: Player, ...any) -> any) -> ()
}

export type ServerAsyncCaller = {
    CallPlayerAsync: (self: ServerAsyncCaller, player: Player, ...any) -> Promise,
    SetCallTimeout: (self: ServerAsyncCaller, timeout: number) -> (),
    GetCallTimeout: (self: ServerAsyncCaller) -> number
}

--- Definitions ---

type RemoteDefinition = ServerToClientEventDefinition
    | ClientToServerEventDefinition
    | ServerAsyncFunctionDefinition
    | ClientAsyncFunctionDefinition

    export type RemoteDefinitions = {[string]: RemoteDefinition}

type NetNamespaceDefinitions = {
    ServerToClientEvent: () -> ServerToClientEventDefinition,
    ClientToServerEvent: (mw: Array<NetMiddleware>?) -> ClientToServerEventDefinition,
    ServerAsyncFunction: (mw: Array<NetMiddleware>?) -> ServerAsyncFunctionDefinition,
    ClientAsyncFunction: () -> ClientAsyncFunctionDefinition,
}

type NetServerDefinition = {
    Get: (self: NetServerDefinition, id: string) -> ServerSenderEvent | ServerListenerEvent | ServerAsyncCallback | ServerAsyncCaller
}

type NetClientDefinition = {
    Get: (self: NetClientDefinition, id: string) -> ClientSenderEvent | ClientListenerEvent | ClientAsyncCallback | ClientAsyncCaller
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

local Net = require(script.dist) :: Net
return Net