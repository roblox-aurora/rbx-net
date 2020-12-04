local function typeCheckMiddleware(...)
    local checks = {...}

    -- The middleware function
    return function(next)
        --  what's returned as callbackFn
        return function(player, ...)
            local args = {...}
            for index, check in ipairs(checks) do
                if not check(args[index]) then
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