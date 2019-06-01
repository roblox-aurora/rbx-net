import { Serializable, Serialize } from "net.Serializer";
import Serializer from "net.Serializer";

export = () => {
	describe("serialization", () => {
		it("should serialize using Net.Serialize", () => {
			class Person {
				public name: string;
				constructor(name: string) {
					this.name = name;
				}
			}

			const person = new Person("Testing");
			const serializedPerson = Serializer.Serialize(person);
			expect(serializedPerson.name).to.equal("Testing");
		});

		it("should serialize using built in class serialize methods", () => {
			class Person {
				public name: string;
				constructor(name: string) {
					this.name = name;
				}

				public serialize(): Serializable<Person> {
					return { name: this.name };
				}
			}

			const person = new Person("Testing 2");
			const serializedPerson = Serializer.Serialize(person);
			expect(serializedPerson.name).to.equal("Testing 2");
		});
	});

	describe("Deserialization", () => {
		it("should deserialize using a method", () => {
			class Person {
				public name: string;
				constructor(name: string) {
					this.name = name;
				}

				public static deserialize(serialized: Serializable<Person>) {
					return new Person(serialized.name);
				}
			}

			const person: Serializable<Person> = { name: "Test Name" };
			const deserialized = Serializer.Deserialize<Person>(person, p => new Person(p.name));

			expect(deserialized instanceof Person).to.equal(true);
			expect(deserialized.name).to.be.ok();
			expect(deserialized.name).to.equal("Test Name");
		});

		it("should allow static deserialization", () => {
			class Person {
				public name: string;
				constructor(name: string) {
					this.name = name;
				}

				public static deserialize(serialized: Serializable<Person>) {
					return new Person(serialized.name);
				}
			}

			const person: Serializable<Person> = { name: "Test Name" };
			const deserialized = Serializer.Deserialize<Person>(person, Person);
			expect(deserialized.name).to.be.ok();
			expect(deserialized.name).to.equal("Test Name");
		});

		it("should allow direct deserialization", () => {
			class Person {
				public name: string;
				constructor(name: string) {
					this.name = name;
				}

				public static deserialize(serialized: Serializable<Person>) {
					return new Person(serialized.name);
				}
			}

			const person: Serializable<Person> = { name: "Test Name" };
			const personTarget = new Person("");
			Serializer.Deserialize<Person>(person, personTarget);
			expect(personTarget.name).to.be.ok();
			expect(personTarget.name).to.equal("Test Name");
		});
	});

	describe("Serializable Checks", () => {
		it("should be true for objects and arrays", () => {
			const testA = { a: 1, b: 2 };
			expect(Serializer.IsSerializable(testA)).to.equal(true);

			const testB = [1, 2, 3];
			expect(Serializer.IsSerializable(testB)).to.equal(true);
		});

		it("should be false for class objects", () => {
			class Testing {}

			const obj = new Testing();
			expect(Serializer.IsSerializable(obj)).to.equal(false);
		});

		it("should be false for mixed objects", () => {
			const test = { [1]: "Hello", a: 10 };
			expect(Serializer.IsSerializable(test)).to.equal(false);
		});

		it("should work for serializable", () => {
			class Testing {}

			const obj = new Testing();

			const objSerialized = Serializer.Serialize(obj);
			expect(Serializer.IsSerializable(objSerialized)).to.equal(true);
		});

		it("should be true for primitives", () => {
			const a = "Test";
			expect(Serializer.IsSerializable(a)).to.equal(true);

			const b = 10;
			expect(Serializer.IsSerializable(b)).to.equal(true);

			const c = true;
			expect(Serializer.IsSerializable(c)).to.equal(true);
		});

		it("should be false for functions", () => {
			const f = () => {};
			expect(Serializer.IsSerializable(f)).to.equal(false);
		});

		it("should be true for roblox types", () => {
			expect(Serializer.IsSerializable(new Vector3(10, 20, 30)));
			expect(Serializer.IsSerializable(new UDim2(0, 1, 2, 3)));
			expect(Serializer.IsSerializable(new Instance("Frame")));
		});
	});
};
