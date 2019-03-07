import Net from "index";
import { Serializable } from "Serializer";
import Serializer from "Serializer";

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
			const serializedPerson = Net.Serialize(person);
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
			const serializedPerson = Net.Serialize(person);
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

		it("should allow wrapping a deserializer", () => {
			class Person {
				constructor(public name: string) {

				}
			}

			const PersonWrapper = Serializer.makeDeserializable(Person, "");
			const person = PersonWrapper.deserialize({ name: "Test" });
			expect(person).to.be.ok();
			expect(person.name).to.equal("Test");
		})

		it("should allow wrapping a deserialization function", () => {
			class Person {
				constructor(public name: string) {

				}
			}

			const PersonWrapper = Serializer.makeDeserializable(Person, p => {
				return new Person(p.name);
			});

			const person = PersonWrapper.deserialize({ name: "Test" });
			expect(person).to.be.ok();
			expect(person.name).to.equal("Test");
		})
	});
};
