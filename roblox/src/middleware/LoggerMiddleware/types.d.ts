export interface LoggingOptions {
	Name?: string;
	Logger?: (name: string, args: unknown[]) => void;
}
