local RunService = game:GetService("RunService")
local HttpService = game:GetService("HttpService")
local IS_STUDIO = RunService:IsStudio();

local function defaultErrorHandler(event, args, index)
    local name = event:GetInstance().Name
    if IS_STUDIO then
        warn("[TypeCheckMiddleware] Call to " .. name .. " failed")
        warn("\tRecieved: " .. HttpService:JSONEncode(args))
        warn("\tInvalid argument at index " .. tostring(index))
    end
end

local MiddlewareGlobal = {}
MiddlewareGlobal.__index = MiddlewareGlobal
MiddlewareGlobal.defaultErrorHandler = defaultErrorHandler

local function typeCheckMiddleware(...)
    local checks = {...}
    local MiddlewareInstance = {}
    MiddlewareInstance.__index = MiddlewareInstance;

    function MiddlewareInstance:next(next, event)
        local errorHandler = self.errorHandler or MiddlewareGlobal.defaultErrorHandler
        --  what's returned as callbackFn
        return function(player, ...)
            local args = {...}
            for index, check in ipairs(checks) do
                if not check(args[index]) then
                    pcall(errorHandler, event, args, index)
                    return false
                end
            end

            -- Invoke the next middleware OR the callback (if none left)
            return next(player, ...)
        end
    end

    function MiddlewareInstance.__tostring()
        return "TypeCheckMiddleware"
    end

    function MiddlewareInstance:WithErrorHandler(fn)
        self.errorHandler = fn
        return self
    end

    function MiddlewareInstance:__call(...)
        return self:next(...)
    end
    
    return setmetatable({}, MiddlewareInstance)
    -- ^ The middleware
end

function MiddlewareGlobal.__call(_, ...)
    return typeCheckMiddleware(...)
end

function MiddlewareGlobal.SetDefaultErrorHandler(_, fn)
    MiddlewareGlobal.defaultErrorHandler = fn
end

return setmetatable({}, MiddlewareGlobal)