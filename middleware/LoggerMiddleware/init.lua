local RunService = game:GetService("RunService")
local HttpService = game:GetService("HttpService")
local IS_STUDIO = RunService:IsStudio()

local function defaultLogger(name, args)
    if IS_STUDIO then
        local str = {};
        for _, arg in ipairs(args) do
            table.insert(str, HttpService:JSONEncode(arg))
        end
        print("[rbx-net] Called", name, "with arguments", "[ " .. table.concat(str, ", ") .. " ]")
    end
end

return function(options)
    options = options or {}
    local logger = options.Logger or defaultLogger

    return function (next, event)
        local name = options.Name or event:GetInstance().Name
        return function(player, ...)
            logger(name, {...})
            return next(player, ...)
        end
    end
end