-- Import lemur
package.path = package.path .. ";?/init.lua"
local lemur = require("vendor.lemur")

local habitat = lemur.Habitat.new()

-- Services
local ReplicatedStorage = habitat.game:GetService("ReplicatedStorage")

-- Utility Functions
local function newFolder(name, parent, content)
	local folder
	if content then
		folder = habitat:loadFromFs(content)
	else
		folder = lemur.Instance.new("Folder")
	end

	folder.Name = name
	folder.Parent = parent

	return folder
end

-- Roblox TS Stuff
local robloxTsFolder = newFolder("RobloxTS", ReplicatedStorage)
newFolder("Include", robloxTsFolder, "include")

-- Modules
newFolder("Modules", robloxTsFolder)
local rbxNet = newFolder("rbx-net", ReplicatedStorage, "out")

-- TestEZ
local testEZFolder = newFolder("TestEZ", ReplicatedStorage, "vendor/testez/lib")

-- Load TestEZ and run our tests
local TestEZ = habitat:require(testEZFolder)


local results = TestEZ.TestBootstrap:run({ rbxNet.Test }, TestEZ.Reporters.TextReporter)



-- Did something go wrong?
if #results.errors > 0 or results.failureCount > 0 then
	os.exit(1)
end
