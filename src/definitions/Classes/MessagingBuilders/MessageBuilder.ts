/* eslint-disable no-restricted-syntax */
import { ServerCallbackMiddleware } from "../../../middleware";
import { ExperienceBroadcastEventDeclaration, ExperienceReplicatingEventDeclaration } from "../../Types";
import { CheckLike, ServerBuilder } from "../RemoteBuilders/RemoteBuilder";

export type Unsafe<T> = T & { readonly __nominal_Unsafe: unique symbol };

export class ReplicatingExperienceBroadcastEventBuilder<TArgs extends ReadonlyArray<unknown>>
	implements ServerBuilder<ExperienceReplicatingEventDeclaration<TArgs>>
{
	public serverCallbackMiddleware = [];
	public OnServer(): ExperienceReplicatingEventDeclaration<TArgs> {
		return {
			Type: "ExperienceEvent",
		} as ExperienceReplicatingEventDeclaration<TArgs>;
	}
}

export class ExperienceBroadcastEventBuilder<TMessage>
	implements ServerBuilder<ExperienceBroadcastEventDeclaration<TMessage>>
{
	public serverCallbackMiddleware = [];

	/**
	 * @internal
	 */
	public WithMessageType<TMessageType>(
		typeCheck: CheckLike<TMessageType>,
	): ExperienceBroadcastEventBuilder<TMessageType> {
		return this as ExperienceBroadcastEventBuilder<TMessageType>;
	}

	/**
	 * @deprecated
	 */
	public WhichCanReplicateToUsers(): ReplicatingExperienceBroadcastEventBuilder<[message: TMessage]> {
		return new ReplicatingExperienceBroadcastEventBuilder();
	}

	/**
	 * @internal
	 */
	public OnServer(): ExperienceBroadcastEventDeclaration<TMessage> {
		return {
			Type: "Messaging",
		} as ExperienceBroadcastEventDeclaration<TMessage>;
	}
}
