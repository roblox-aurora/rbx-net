import cache from "GuidCache";

export = () => {
	describe("guid cache", () => {
		it("should create a guid", () => {
			const result = cache.GetOrCreateIdFromName("RemoteEvent", "Testing");
			expect(result).to.be.ok();
		});

		it("should persist the guid", () => {
			const result = cache.GetOrCreateIdFromName("RemoteEvent", "Testing");

			const fetch = cache.GetIdFromName("RemoteEvent", "Testing");
			expect(fetch).to.equal(result);
		});

		it("should prevent changing cache state after it's been locked", () => {
			cache.Lock();
			expect(() => cache.SetEnabled(false)).to.throw();
		});
	});
};
