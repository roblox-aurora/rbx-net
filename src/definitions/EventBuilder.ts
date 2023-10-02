import { types } from "../validation";

export class EventBuilder<T extends ReadonlyArray<types.check<unknown>>> {
	public constructor(/** @internal */ public readonly validators: T) {}
}
