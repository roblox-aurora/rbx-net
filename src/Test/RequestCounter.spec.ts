import throttle from "net.Throttle";

const Players = game.GetService("Players");
const LocalPlayer = Players.LocalPlayer!;

export = () => {
	describe("request counter", () => {
		it("should handle counting", () => {
			const counter = throttle.Get("TestCounter1");
			counter.Increment(LocalPlayer);

			expect(counter.Get(LocalPlayer)).to.equal(1);
		});

		it("should handle resetting the counter", () => {
			const counter = throttle.Get("TestCounter2");
			counter.Increment(LocalPlayer);

			counter.ClearAll();

			expect(counter.Get(LocalPlayer)).to.equal(0);
		});

		it("should handle resetting all counters", () => {
			const counter1 = throttle.Get("TestCounter3");
			counter1.Increment(LocalPlayer);

			const counter2 = throttle.Get("TestCounter4");
			counter2.Increment(LocalPlayer);
			counter2.Increment(LocalPlayer);

			expect(counter1.Get(LocalPlayer)).to.equal(1);
			expect(counter2.Get(LocalPlayer)).to.equal(2);

			throttle.Clear();

			expect(counter1.Get(LocalPlayer)).to.equal(0);
			expect(counter2.Get(LocalPlayer)).to.equal(0);
		});
	});
};
