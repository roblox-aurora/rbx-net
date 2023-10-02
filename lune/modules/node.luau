local process = require("@lune/process")

local node = {}

function node.publish()
	local params = { "publish" }

	if process.os == "windows" then
		return process.spawn("npm.cmd", params)
	else
		return process.spawn("npm", params)
	end
end

return node
