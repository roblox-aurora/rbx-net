export interface NetServerSignalConnection {
	/** @internal */
	readonly NetSignal: NetServerScriptSignal<Callback, RemoteEvent | RemoteFunction>;
	/** @internal */
	readonly RBXSignal: RBXScriptConnection;
	Connected: boolean;
	Callback: (player: Player, ...args: unknown[]) => void;
	Disconnect(this: NetServerSignalConnection): void;
}

/**
 * A wrapper around a RBXScriptSignal for remotes, that always has a listener set.
 */
export class NetServerScriptSignal<
	T extends (player: Player, ...args: unknown[]) => void,
	I extends RemoteEvent | RemoteFunction
> {
	private connections = new Array<RBXScriptConnection>();
	private defaultConnection?: RBXScriptConnection;
	private connectionRefs = new WeakSet<NetServerSignalConnection>();

	private defaultConnectionDelegate: T = ((player, ...args) => {
		// TODO: Make usable for analytics
	}) as T;

	public constructor(private signalInstance: RBXScriptSignal<T>, private instance: I) {
		this.defaultConnection = signalInstance.Connect(this.defaultConnectionDelegate);
		const sig = this.instance.AncestryChanged.Connect((child, parent) => {
			if (child === instance && parent === undefined) {
				this.DisconnectAll();
				sig.Disconnect();
			}
		});
	}

	/**
	 * @internal
	 */
	public Invoke(player: Player, ...args: unknown[]) {
		this.connectionRefs.forEach((connection) => connection.Callback(player, ...args));
	}

	/**
	 * Establishes a function to be called whenever the event is raised. Returns a RBXScriptConnection object associated with the connection.
	 * @param callback — The function to be called whenever the event is fired.
	 */
	public Connect(callback: T): NetServerSignalConnection {
		if (this.defaultConnection) {
			this.defaultConnection.Disconnect();
			this.defaultConnection = undefined;
		}

		const connection = this.signalInstance.Connect(callback);
		this.connections.push(connection);

		const ref = identity<Readonly<NetServerSignalConnection>>({
			NetSignal: this,
			RBXSignal: connection,
			Connected: connection.Connected,
			Callback: callback,
			Disconnect() {
				const idx = this.NetSignal.connections.findIndex((f) => f === ref);
				if (idx !== -1) {
					this.NetSignal.DisconnectAt(idx);
					this.Connected = false;
				}
			},
		});

		this.connectionRefs.add(ref);
		return ref;
	}

	public Wait(): LuaTuple<Parameters<T>> {
		return this.signalInstance.Wait();
	}

	public WaitAsync(): Promise<LuaTuple<Parameters<T>>> {
		return Promise.defer((resolve) => {
			const result = this.signalInstance.Wait();
			resolve(result);
		});
	}

	/**
	 * Gets the current count of connections to this signal
	 * @returns
	 */
	public GetCount() {
		return this.connections.size();
	}

	/** @internal */
	public DisconnectAt(index: number) {
		const connection = this.connections[index];
		if (connection) {
			connection.Disconnect();
			this.connections.remove(index);
		}

		if (this.connections.size() === 0) {
			this.defaultConnection = this.signalInstance.Connect(this.defaultConnectionDelegate);
		}
	}

	public DisconnectAll() {
		for (const connection of this.connections) {
			connection.Disconnect();
		}
		this.connections.clear();

		for (const ref of this.connectionRefs) {
			ref.Connected = false;
		}
		this.connectionRefs.clear();

		this.defaultConnection = this.signalInstance.Connect(this.defaultConnectionDelegate);
	}
}
