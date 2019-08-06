-- Compiled with https://roblox-ts.github.io v0.2.14
-- August 6, 2019, 5:20 PM New Zealand Standard Time

local TS = require(script.Parent.Parent.vendor.RuntimeLib);
local exports;
local throttle = TS.import(script.Parent.Parent, "Throttle");
local Players = game:GetService("Players");
local LocalPlayer = Players.LocalPlayer;
exports = function()
	describe("request counter", function()
		it("should handle counting", function()
			local counter = throttle:Get("TestCounter1");
			counter:Increment(LocalPlayer);
			expect(counter:Get(LocalPlayer)).to.equal(1);
		end);
		it("should handle resetting the counter", function()
			local counter = throttle:Get("TestCounter2");
			counter:Increment(LocalPlayer);
			counter:ClearAll();
			expect(counter:Get(LocalPlayer)).to.equal(0);
		end);
		it("should handle resetting all counters", function()
			local counter1 = throttle:Get("TestCounter3");
			counter1:Increment(LocalPlayer);
			local counter2 = throttle:Get("TestCounter4");
			counter2:Increment(LocalPlayer);
			counter2:Increment(LocalPlayer);
			expect(counter1:Get(LocalPlayer)).to.equal(1);
			expect(counter2:Get(LocalPlayer)).to.equal(2);
			throttle:Clear();
			expect(counter1:Get(LocalPlayer)).to.equal(0);
			expect(counter2:Get(LocalPlayer)).to.equal(0);
		end);
	end);
end;
return exports;
