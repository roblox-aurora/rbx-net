import { NetMiddleware } from "../../middleware";
import { LoggingOptions } from "./types";

declare const createLoggerMiddleware: (options?: LoggingOptions) => NetMiddleware;
export = createLoggerMiddleware;
