import { Serializer } from "../RemoteBuilders/DefinitionBuilder";

export class SerializedTypeBuilder<T extends object, S> {
	public constructor(private serializer: Serializer<T, S>) {}

	public Serialize(value: T): S {
		return this.serializer.Serialize(value);
	}

	public Deserialize(value: S): T {
		return this.serializer.Deserialize(value);
	}
}
