-- Compiled with https://roblox-ts.github.io v0.2.14
-- August 6, 2019, 5:29 PM New Zealand Standard Time

local TS = require(script.Parent.Parent.vendor.RuntimeLib);
local exports;
local Serializer = TS.import(script.Parent.Parent, "Serializer");
exports = function()
	describe("serialization", function()
		it("should serialize using Net.Serialize", function()
			local Person;
			do
				Person = setmetatable({}, {
					__tostring = function() return "Person" end;
				});
				Person.__index = Person;
				function Person.new(...)
					local self = setmetatable({}, Person);
					self:constructor(...);
					return self;
				end;
				function Person:constructor(name)
					self.name = name;
				end;
			end;
			local person = Person.new("Testing");
			local serializedPerson = Serializer.Serialize(person);
			expect(serializedPerson.name).to.equal("Testing");
		end);
		it("should serialize using built in class serialize methods", function()
			local Person;
			do
				Person = setmetatable({}, {
					__tostring = function() return "Person" end;
				});
				Person.__index = Person;
				function Person.new(...)
					local self = setmetatable({}, Person);
					self:constructor(...);
					return self;
				end;
				function Person:constructor(name)
					self.name = name;
				end;
				function Person:serialize()
					return {
						name = self.name;
					};
				end;
			end;
			local person = Person.new("Testing 2");
			local serializedPerson = Serializer.Serialize(person);
			expect(serializedPerson.name).to.equal("Testing 2");
		end);
	end);
	describe("Deserialization", function()
		it("should deserialize using a method", function()
			local Person;
			do
				Person = setmetatable({}, {
					__tostring = function() return "Person" end;
				});
				Person.__index = Person;
				function Person.new(...)
					local self = setmetatable({}, Person);
					self:constructor(...);
					return self;
				end;
				function Person:constructor(name)
					self.name = name;
				end;
				function Person.deserialize(self, serialized)
					return Person.new(serialized.name);
				end;
			end;
			local person = {
				name = "Test Name";
			};
			local deserialized = Serializer.Deserialize(person, function(p)
				return Person.new(p.name);
			end);
			expect(TS.instanceof(deserialized, Person)).to.equal(true);
			expect(deserialized.name).to.be.ok();
			expect(deserialized.name).to.equal("Test Name");
		end);
		it("should allow static deserialization", function()
			local Person;
			do
				Person = setmetatable({}, {
					__tostring = function() return "Person" end;
				});
				Person.__index = Person;
				function Person.new(...)
					local self = setmetatable({}, Person);
					self:constructor(...);
					return self;
				end;
				function Person:constructor(name)
					self.name = name;
				end;
				function Person.deserialize(self, serialized)
					return Person.new(serialized.name);
				end;
			end;
			local person = {
				name = "Test Name";
			};
			local deserialized = Serializer.Deserialize(person, Person);
			expect(deserialized.name).to.be.ok();
			expect(deserialized.name).to.equal("Test Name");
		end);
		it("should allow direct deserialization", function()
			local Person;
			do
				Person = setmetatable({}, {
					__tostring = function() return "Person" end;
				});
				Person.__index = Person;
				function Person.new(...)
					local self = setmetatable({}, Person);
					self:constructor(...);
					return self;
				end;
				function Person:constructor(name)
					self.name = name;
				end;
				function Person.deserialize(self, serialized)
					return Person.new(serialized.name);
				end;
			end;
			local person = {
				name = "Test Name";
			};
			local personTarget = Person.new("");
			Serializer.Deserialize(person, personTarget);
			expect(personTarget.name).to.be.ok();
			expect(personTarget.name).to.equal("Test Name");
		end);
	end);
	describe("Serializable Checks", function()
		it("should be true for objects and arrays", function()
			local testA = {
				a = 1;
				b = 2;
			};
			expect(Serializer.IsSerializable(testA)).to.equal(true);
			local testB = { 1, 2, 3 };
			expect(Serializer.IsSerializable(testB)).to.equal(true);
		end);
		it("should be false for class objects", function()
			local Testing;
			do
				Testing = setmetatable({}, {
					__tostring = function() return "Testing" end;
				});
				Testing.__index = Testing;
				function Testing.new(...)
					local self = setmetatable({}, Testing);
					self:constructor(...);
					return self;
				end;
				function Testing:constructor(...)
				end;
			end;
			local obj = Testing.new();
			expect(Serializer.IsSerializable(obj)).to.equal(false);
		end);
		it("should be false for mixed objects", function()
			local test = {
				[1] = "Hello";
				a = 10;
			};
			expect(Serializer.IsSerializable(test)).to.equal(false);
		end);
		it("should work for serializable", function()
			local Testing;
			do
				Testing = setmetatable({}, {
					__tostring = function() return "Testing" end;
				});
				Testing.__index = Testing;
				function Testing.new(...)
					local self = setmetatable({}, Testing);
					self:constructor(...);
					return self;
				end;
				function Testing:constructor(...)
				end;
			end;
			local obj = Testing.new();
			local objSerialized = Serializer.Serialize(obj);
			expect(Serializer.IsSerializable(objSerialized)).to.equal(true);
		end);
		it("should be true for primitives", function()
			local a = "Test";
			expect(Serializer.IsSerializable(a)).to.equal(true);
			local b = 10;
			expect(Serializer.IsSerializable(b)).to.equal(true);
			local c = true;
			expect(Serializer.IsSerializable(c)).to.equal(true);
		end);
		it("should be false for functions", function()
			local f = function()
			end;
			expect(Serializer.IsSerializable(f)).to.equal(false);
		end);
		it("should be true for roblox types", function()
			expect(Serializer.IsSerializable(Vector3.new(10, 20, 30)));
			expect(Serializer.IsSerializable(UDim2.new(0, 1, 2, 3)));
			expect(Serializer.IsSerializable(Instance.new("Frame")));
		end);
	end);
end;
return exports;
