import { findOrCreateRemote, IS_CLIENT, TypeGuard, StaticArguments, checkArguments, TypeGuards } from "./internal";

export interface ServerRecieverEvent<C> {
	Connect(callback: (sourcePlayer: Player, ...args: StaticArguments<C>) => void): RBXScriptConnection;
}

export interface ServerSenderEvent<F> {
	SendToAllPlayers(...args: StaticArguments<F>): void;
	SendToPlayer(player: Player, ...args: StaticArguments<F>): void;
	SendToPlayers(players: Array<Player>, ...args: StaticArguments<F>): void;
	SendToAllPlayersExcept(blacklist: Player | Array<Player>, ...args: StaticArguments<F>): void;
}

type InferEvent<T> = T extends [TypeGuard<infer A>]
	? NetServerEvent<[TypeGuard<A>]>
	: T extends [TypeGuard<infer A>, TypeGuard<infer B>]
	? NetServerEvent<[TypeGuard<A>, TypeGuard<B>]>
	: T extends [TypeGuard<infer A>, TypeGuard<infer B>, TypeGuard<infer C>]
	? NetServerEvent<[TypeGuard<A>, TypeGuard<B>, TypeGuard<C>]>
	: T extends [TypeGuard<infer A>, TypeGuard<infer B>, TypeGuard<infer C>, TypeGuard<infer D>]
	? NetServerEvent<[TypeGuard<A>, TypeGuard<B>, TypeGuard<C>, TypeGuard<D>]>
	: NetServerEvent;

type FilteredKeys<T, U> = { [P in keyof T]: T[P] extends U ? P : never }[keyof T];
type UsableEvents<T> = { [Q in FilteredKeys<T, true | TypeGuards<any>>]: InferEvent<T[Q]> };

interface EventList {
	// tslint:disable-next-line: array-type
	[name: string]: ((player: Player, ...args: unknown[]) => void) | true | Array<TypeGuard<any>>;
}

const Players = game.GetService("Players");
/**
 * An event on the server
 * @rbxts server
 */
export default class NetServerEvent<C extends Array<any> = Array<unknown>, F extends Array<any> = Array<unknown>>
	implements IServerNetEvent, ServerRecieverEvent<C>, ServerSenderEvent<F> {
	/** @internal */
	protected instance: RemoteEvent;
	protected propTypes: C | undefined;
	protected callTypes: F | undefined;

	/**
	 * Creates a new instance of a server event (Will also create the corresponding remote if it does not exist!)
	 * @param name The name of this server event
	 * @throws If not created on server
	 */
	constructor(name: string, ...recievedPropTypes: C) {
		this.instance = findOrCreateRemote("RemoteEvent", name);
		assert(!IS_CLIENT, "Cannot create a Net.ServerEvent on the Client!");

		if (recievedPropTypes.size() > 0) {
			this.propTypes = recievedPropTypes;
		}
	}

	/**
	 * Creates a RemoteEvent that's not managed by Net.
	 *
	 * Note: Any features like throttling, caching, type checking etc. will have to be handled by you.
	 *
	 * @param name The name
	 */
	public static Unmanaged(name: string) {
		return findOrCreateRemote("RemoteEvent", name);
	}

	public static Group<T extends EventList>(list: T): UsableEvents<T> {
		const map = new Map<string, NetServerEvent>();
		for (const [key, value] of Object.entries<EventList>(list)) {
			if (typeIs(value, "table")) {
				// @ts-ignore
				const item = new NetServerEvent(key as string, ...value);
				map.set(key as string, item);
			} else if (typeIs(value, "boolean")) {
				map.set(key as string, new NetServerEvent(key as string));
			} else if (typeIs(value, "function")) {
				const event = new NetServerEvent(key as string);
				event.Connect(value);
			}
		}
		return map as {[name: string]: any} as UsableEvents<T>;
	}

	public static PureReciever<C extends Array<any> = Array<unknown>>(
		name: string,
		cb: (plr: Player, ...args: StaticArguments<C>) => void,
		...recievedPropTypes: C
	) {
		const event = new NetServerEvent(name, ...recievedPropTypes);
		event.Connect(cb);
		return event as ServerRecieverEvent<C>;
	}

	public static PureSender<C extends Array<any> = Array<unknown>>(name: string, ...recievedPropTypes: C) {
		const event = new NetServerEvent(name, ...recievedPropTypes);
		return event as ServerSenderEvent<C>;
	}

	public WithStrictCall<F0 extends F>(...callPropTypes: F0): NetServerEvent<C, F0> {
		this.callTypes = callPropTypes;
		return (this as unknown) as NetServerEvent<C, F0>;
	}

	/**
	 * The RemoteEvent instance
	 */
	public GetInstance() {
		return this.instance;
	}

	/**
	 * The RBXScriptSignal for this RemoteEvent
	 */
	public GetEvent() {
		return this.instance.OnServerEvent;
	}

	/**
	 * Connect a fucntion to fire when the event is invoked by the client
	 * @param callback The function fired when the event is invoked by the client
	 */
	public Connect(callback: (sourcePlayer: Player, ...args: StaticArguments<C>) => void) {
		if (this.propTypes !== undefined) {
			return this.GetEvent().Connect((sourcePlayer: Player, ...args: Array<unknown>) => {
				// @ts-ignore ... again. unfortunately.
				if (checkArguments(this.propTypes!, args)) {
					// @ts-ignore
					callback(sourcePlayer, ...args);
				}
			});
		} else {
			return this.GetEvent().Connect(callback as Callback);
		}
	}

	/**
	 * Sends the specified arguments to all players
	 * @param args The arguments to send to the players
	 */
	public SendToAllPlayers(...args: StaticArguments<F>) {
		if (this.callTypes !== undefined) {
			if (!checkArguments(this.callTypes, args)) {
				return;
			}
		}

		this.instance.FireAllClients(...(args as Array<unknown>));
	}

	/**
	 * Will send this message to all players except specified players
	 * @param blacklist The blacklist
	 * @param args The arguments
	 */
	public SendToAllPlayersExcept(blacklist: Player | Array<Player>, ...args: StaticArguments<F>) {
		if (this.callTypes !== undefined) {
			if (!checkArguments(this.callTypes, args)) {
				return;
			}
		}

		if (typeIs(blacklist, "Instance")) {
			const otherPlayers = Players.GetPlayers().filter(p => p !== blacklist);
			for (const player of otherPlayers) {
				this.instance.FireClient(player, ...(args as Array<unknown>));
			}
		} else if (typeIs(blacklist, "table")) {
			for (const player of Players.GetPlayers()) {
				if (blacklist.indexOf(player) === -1) {
					this.instance.FireClient(player, ...(args as Array<unknown>));
				}
			}
		}
	}

	/**
	 * Sends the specified arguments to a specified player
	 * @param player The player
	 * @param args The arguments to send to the player
	 */
	public SendToPlayer(player: Player, ...args: StaticArguments<F>) {
		if (this.callTypes !== undefined) {
			if (!checkArguments(this.callTypes, args)) {
				return;
			}
		}

		this.instance.FireClient(player, ...(args as Array<unknown>));
	}

	/**
	 * Sends the specified argumetns to the specified list of players
	 * @param players The players
	 * @param args The arugments to send to these players
	 */
	public SendToPlayers(players: Array<Player>, ...args: StaticArguments<F>) {
		if (this.callTypes !== undefined) {
			if (!checkArguments(this.callTypes, args)) {
				return;
			}
		}

		for (const player of players) {
			// @ts-ignore
			this.SendToPlayer(player, ...(args as Array<unknown>));
		}
	}
}
