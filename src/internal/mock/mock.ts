type RemoteEventLike<T extends Callback> = Pick<
	RemoteEvent<T>,
	Exclude<keyof RemoteEvent, keyof Instance | "_nominal_RemoteEvent">
>;

type RemoteFunctionLike<T extends Callback> = Pick<
	RemoteFunction<T>,
	Exclude<keyof RemoteFunction, keyof Instance | "_nominal_RemoteFunction">
>;

export class MockScriptSignal<T extends Callback = Callback> implements RBXScriptSignal<T> {
	Once(this: RBXScriptSignal<Callback>, callback: T): RBXScriptConnection {
		throw `TODO`;
	}

	Connect(this: RBXScriptSignal<Callback>, callback: Callback): RBXScriptConnection {
		throw `TODO`;
	}

	ConnectParallel(this: RBXScriptSignal<Callback>, callback: Callback): RBXScriptConnection {
		throw `TODO`;
	}

	Wait(this: RBXScriptSignal<Callback>): LuaTuple<Parameters<T>> {
		throw `TODO`;
	}
}

export class MockInstance
	implements
		Pick<
			Instance,
			"GetAttribute" | "SetAttribute" | "GetAttributeChangedSignal" | "GetAttributes" | "Name" | "ClassName"
		> {
	private attributes = new Map<string, AttributeValue>();

	public Name = "RemoteEvent";
	public ClassName = "RemoteEvent";

	GetAttribute(attribute: string): AttributeValue | undefined {
		return this.attributes.get(attribute);
	}

	SetAttribute(attribute: string, value: AttributeValue | undefined): void {
		if (value !== undefined) {
			this.attributes.set(attribute, value);
		} else {
			this.attributes.delete(attribute);
		}
	}

	GetAttributeChangedSignal(attribute: string): RBXScriptSignal<Callback> {
		return new MockScriptSignal();
	}

	GetAttributes(): Map<string, AttributeValue> {
		return this.attributes;
	}
}

export class MockRemoteEvent<T extends Callback = Callback> extends MockInstance implements RemoteEventLike<T> {
	FireAllClients(...args: Parameters<Callback>[]): void {}

	FireClient(player: Player, ...args: Parameters<Callback>[]): void {}

	FireServer(...args: Parameters<Callback>[]): void {}

	OnClientEvent: MockScriptSignal<T>;
	OnServerEvent: MockScriptSignal<(player: Player, ...args: unknown[]) => void>;

	public constructor() {
		super();
		this.OnServerEvent = new MockScriptSignal();
		this.OnClientEvent = new MockScriptSignal();
	}
}

export class MockRemoteFunction<T extends Callback = Callback> extends MockInstance implements RemoteFunctionLike<T> {
	public constructor() {
		super();
	}

	InvokeClient(player: Player, ...args: T[]): unknown {
		throw `Not implemented`;
	}

	InvokeServer(...args: Parameters<T>): ReturnType<T> {
		throw `Not implemented`;
	}

	OnClientInvoke: T | undefined;
	OnServerInvoke: ((player: Player, ...args: unknown[]) => void) | undefined;
}
