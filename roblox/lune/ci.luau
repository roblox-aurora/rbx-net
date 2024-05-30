--!strict
--[[
    Automatic deployment and artefact builder for Net
]]

local process = require("@lune/process")
local path = require("modules/path")
local node = require("modules/node")
local fs = require("@lune/fs")

local luauDir = path.join(process.cwd, "luau")

local luauDistDir = path.join(luauDir, "dist")
local robloxArtefactsDir = path.join(luauDir, "artefacts")

local outDir = path.join(process.cwd, "out")

local function compileLuau()
	return process.spawn("node", {
		"node_modules/roblox-ts/out/CLI/cli.js",
		"--verbose",
		"--type",
		"model",
		'--rojo="luau/build.project.json"',
	}, {
		env = {
			TYPE = "Luau",
			NODE_ENV = "production",
		},
	})
end

local function compileTypeScript()
	return process.spawn("node", {
		"node_modules/roblox-ts/out/CLI/cli.js",
		"--verbose",
	}, {
		env = {
			TYPE = "TS",
			NODE_ENV = "production",
		},
	})
end

local function buildTypeScript() end

type File = { filePath: string, fileName: string }
type FileIter = (file: File) -> ()
local function eachFile(path: string, fn: FileIter, recursive: boolean?): ()
	for _, child in fs.readDir(path) do
		local fullPath = `{path}/{child}`

		if fs.isFile(fullPath) then
			fn({
				filePath = fullPath,
				fileName = child,
			})
		elseif fs.isDir(fullPath) and recursive == true then
			eachFile(fullPath, fn, true)
		end
	end
end

local function copyFiles(fromPath: string, toPath: string, recursive: boolean)
	eachFile(fromPath, function(file)
        local parent = path.dirname(file.filePath)
        print(parent)

        local fromPath = path.join(fromPath, file.fileName)
        local toPath = path.join(toPath, file.fileName)

        print(fromPath, toPath)
    end, recursive)
end

local function buildLuau()
	if fs.isDir(outDir) then
		fs.removeDir(outDir)
	end

	local compilation = compileLuau()
	if not compilation.ok then
		print(compilation.stdout)
		process.exit(1)
	else
		print("Compiled Luau Dist... OK")
	end

	-- # mkdir -p out/dist/TS
	fs.writeDir(path.join(outDir, "dist", "TS"))

	-- # cp -r ../include/* out/dist/TS
	copyFiles(path.join(process.cwd, "include"), path.join(outDir, "dist", "TS"), true)

	-- cp -r ../out/* out/dist
	copyFiles(outDir, path.join(outDir, "dist"), true)
end

buildLuau()
