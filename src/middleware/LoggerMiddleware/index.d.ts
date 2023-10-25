import { ServerCallbackMiddleware } from "../../middleware";
import { LoggingOptions } from "./types";

declare const createLoggerMiddleware: (options?: LoggingOptions) => ServerCallbackMiddleware;
export = createLoggerMiddleware;
