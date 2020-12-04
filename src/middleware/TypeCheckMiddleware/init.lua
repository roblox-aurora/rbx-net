local RunService = game:GetService("RunService")
local HttpService = game:GetService("HttpService")
local IS_STUDIO = RunService:IsStudio();
local function typeCheckMiddleware(...)
    local checks = {...}

    -- The middleware function
    return function(next, event)
        local name = event:GetInstance().Name

        --  what's returned as callbackFn
        return function(player, ...)
            local args = {...}
            for index, check in ipairs(checks) do
                if not check(args[index]) then
                    if IS_STUDIO then
                        warn("[TypeCheckMiddleware] Call to " .. name .. " failed")
                        warn("\tRecieved: " .. HttpService:JSONEncode(args))
                        warn("\tInvalid argument at index " .. tostring(index))
                    end
                    return false
                end
            end
            
            -- Invoke the next middleware OR the callback (if none left)
            next(player, ...)
        end
    end
    -- ^ The middleware
end

return typeCheckMiddleware