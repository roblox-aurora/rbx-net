interface RbxNetConfigItem {
    /**
     * The throttle reset timer (default: 60 seconds)
     */
    ServerThrottleResetTimer: number;
    /**
     * The message shown when the throttle has been exceeded.
     * {player} will be replaced with the player's name!
     */
    ServerThrottleMessage: string;
    /** @internal */
    __stfuTypescript: undefined;
}
declare namespace NetConfig {
    function SetConfiguration<K extends keyof RbxNetConfigItem>(key: K, value: RbxNetConfigItem[K]): void;
    function GetConfiguration<K extends keyof RbxNetConfigItem>(key: K): RbxNetConfigItem[K];
}
export = NetConfig;
