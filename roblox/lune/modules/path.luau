--!strict
local process = require("@lune/process")
local path = {}
local SEP = if process.os == "windows" then "\\" else "/"

--- Join multiple path parts into a combined path
--- @return A joined path
function path.join(...: string): string
	return path.ospath(table.concat({ ... }, SEP))
end

--- Gets the extension of the given path (if applicable) - otherwise returns nil
--- @param path The path to get the extension of
--- @return The path extension or nil
function path.extname(path: string): string?
	return string.match(path, ".(%.[A-z0-9_-]+)$")
end

--- Gets the full directory path of the given path
--- @param value The path
--- @return The full directory path without the end item
function path.dirname(value: string): string
	local parts = string.split(path.ospath(value), SEP)
	table.remove(parts, #parts)
	return table.concat(parts, SEP)
end

--- Fixes the path so that it's properly formatted to the local operating system
--- @param path The path to format
--- @return A fixed path matching the OS format
function path.ospath(path: string): string
	local newPath = ""

	if process.os == "windows" then
		local i = 1
		while i <= #path do
			local char = string.sub(path, i, i)
			if char == "/" then
				char = "\\"
			end

			newPath ..= char
			i += 1
		end

		newPath = newPath:gsub("\\+", "\\")
	else
		local i = 1
		while i <= #path do
			local char = string.sub(path, i, i)
			if char == "\\" then
				char = "/"
			end

			newPath ..= char
			i += 1
		end

		newPath = newPath:gsub("/+", "/")
	end

	return newPath
end

--- The OS-specific path separator
path.sep = SEP
return path
