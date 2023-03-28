---
id: net.middleware
title: Net.Middleware Namespace
sidebar_label: Net.Middleware
slug: /api/middleware
---

## TypeChecking
### Basic Type Checker
```ts
function TypeChecking(...checks: TypeCheck[]): TypeCheckingMiddleware
```
Function
- Parameters
    - `...checks` Type checking functions in order of the arguments passed to the remote

## RateLimit
The built-in rate limiting middleware.
```ts
interface RateLimitError {
	Message: string;
	UserId: number;
	RemoteId: string;
	MaxRequestsPerMinute: number;
}
interface RateLimitOptions {
    MaxRequestsPerMinute: number;
	ErrorHandler?: (error: RateLimitError) => void;
}
function RateLimit(options: RateLimitOptions): RateLimitingMiddleware
```
Function
- Parameters
    - `options` The options for the rate limiter

## Logging
The built-in logging middleware
```ts
interface LoggingOptions {
	Name?: string;
	Logger?: (name: string, args: unknown[]) => void;
}
function Logging(options?: LoggingOptions): LoggerMiddleware
```
Function
- Parameters
    - `options` The options for the logger