-- Compiled with roblox-ts v1.1.1
local TS = require(script.Parent.Parent.TS.RuntimeLib)
--[[
	*
	* Types
	*
	* I will admit, this is a lot of type spaghetti. It makes the definitions work good though. :D
]]
local oneOf = TS.import(script, script.Parent.Parent, "internal", "validator").oneOf
--[[
	*
	* The DefinitionBuilders type
]]
--[[
	*
	* @deprecated
]]
--[[
	*
	* A declaration for an async client function
]]
--[[
	*
	* A declaration for an async server function
]]
-- * @deprecated
--[[
	*
	* A declaration for a client -> server event
]]
--[[
	*
	* A declaration for a server -> client event
]]
--[[
	*
	* A declaration for a Bidirectional event
]]
--[[
	*
	* A declaration group
]]
-- //////////////////////////////
-- * Inference Magic
-- /////////////////////////////
--[[
	*
	* This infers the client remote type based on the given value
]]
--[[
	*
	* This infers the server remote type based on the given value
]]
-- ///////////////////////////////////////
-- * Results
-- ///////////////////////////////////////
local DeclarationTypeCheck = oneOf("Event", "Function", "AsyncFunction", "Namespace")
return {
	DeclarationTypeCheck = DeclarationTypeCheck,
}
