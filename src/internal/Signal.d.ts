/**
 * BindableEvent wrapper which passes variables by reference instead of by value
 */
interface Signal<
	ConnectedFunctionSignature extends (...args: any) => any = () => void,
	Generic extends boolean = false
> {
	/**
	 * Fires the BindableEvent with any number of arguments
	 * @param args The arguments to pass into the connected functions
	 * @internal
	 */
	Fire(...args: Parameters<ConnectedFunctionSignature>): void;

	/**
	 * Connects a callback to BindableEvent.Event
	 * @param callback The function to connect to BindableEvent.Event
	 */
	Connect<O extends Array<unknown> = Parameters<ConnectedFunctionSignature>>(
		callback: Generic extends true
			? Parameters<ConnectedFunctionSignature> extends Array<unknown>
				? (...args: O) => void
				: ConnectedFunctionSignature
			: ConnectedFunctionSignature,
	): RBXScriptConnection;

	/**
	 * Yields the current thread until the thread is fired.
	 */
	Wait(): LuaTuple<Parameters<ConnectedFunctionSignature>>;

	/**
	 * Destroys the Signal
	 * @internal
	 */
	Destroy(): void;
}

declare const Signal: new <
	ConnectedFunctionSignature extends (...args: any) => any = () => void,
	Generic extends boolean = false
>() => Signal<ConnectedFunctionSignature, Generic>;

export = Signal;
