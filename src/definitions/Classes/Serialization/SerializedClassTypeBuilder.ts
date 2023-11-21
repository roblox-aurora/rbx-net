import { $package } from "rbxts-transform-debug";
import { isSerializedData } from "../../../internal";
import { Constructor, Prototype } from "../../Types";
import { ClassSerializer } from "../RemoteBuilders/DefinitionBuilder";
import { CheckLike } from "../RemoteBuilders/RemoteBuilder";

export class SerializedClassTypeBuilder<TClass extends Constructor> {
	private serializer: ClassSerializer<TClass, Record<string, defined>>;
	public constructor(private classType: TClass) {
		this.serializer = {
			$serdeId: tostring(this.classType),
			$serdeName: $package.name,
			$serdeType: this.classType,
			Serialize(object) {
				const rawData = setmetatable(table.clone(object), undefined!);

				return {
					$classId: this.$serdeId,
					$data: rawData as Record<string, defined>,
				};
			},
			Deserialize(object) {
				const construct = this.$serdeType;
				return setmetatable(
					object.$data,
					construct as LuaMetatable<Record<string, defined>>,
				) as Prototype<TClass>;
			},
			ValidateData(value): value is Record<string, defined> {
				return isSerializedData(value) && value.$classId === this.$serdeId;
			},
		};
	}

	public Serialize(value: Prototype<TClass>) {
		return this.serializer.Serialize(value);
	}

	public GetSerializer() {
		return this.serializer;
	}

	public GetType(): CheckLike<Prototype<TClass>> {
		return (value: unknown): value is Prototype<TClass> => {
			return this.serializer.ValidateData(value);
		};
	}
}
