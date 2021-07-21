import { NetManagedInstance } from ".";
import Signal from "./Signal";

export namespace NetEvents {
	export const ServerRemoteCalledWithNoHandler = new Signal<
		(playerWhoCalled: Player, affectedRemote: NetManagedInstance) => void
	>();
	export type SignalCallback<T extends Signal> = T extends Signal<infer V> ? V : never;
}
export type NetEvents = typeof NetEvents;
