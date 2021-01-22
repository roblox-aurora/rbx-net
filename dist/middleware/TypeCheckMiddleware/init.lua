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

local function typeCheckMiddleware(options, checks)
    local errorHandler = options.errorHandler or defaultErrorHandler
    -- The middleware function
    return function(next, event)
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
    -- ^ The middleware
end

local TypeCheckMiddleware = {};
TypeCheckMiddleware.__index = TypeCheckMiddleware

function TypeCheckMiddleware.__call(_, ...)
    return typeCheckMiddleware({}, {...})
end

function TypeCheckMiddleware.new(options)
    local self = {}
    self.ErrorHandler = options.ErrorHandler
    return setmetatable(self, TypeCheckMiddleware)
end

function TypeCheckMiddleware:Check(...)
    return typeCheckMiddleware(self, {...})
end

function TypeCheckMiddleware:SetErrorHandler(handler)
    assert(type(handler) == "function")
    self.ErrorHandler = handler
end

return setmetatable({}, TypeCheckMiddleware)