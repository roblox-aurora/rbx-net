export function md5(data: string): string;
export function sha1(data: string): string;

/** SHA-2 Functions */

export function sha224(data: string): string;
export function sha256(data: string): string;
export function sha512_224(data: string): string;
export function sha512_256(data: string): string;
export function sha384(data: string): string;
export function sha512(data: string): string;

/** SHA-3 Functions */

export function sha3_224(data: string): string;
export function sha3_256(data: string): string;
export function sha3_384(data: string): string;
export function sha3_512(data: string): string;
export function shake128(data: string): string;
export function shake256(data: string): string;

/** Misc Utilities */

export function hmac(hash: (data: string) => string, key: string, data: string): string;
export function hex_to_bin(data: string): string;
export function base64_to_bin(data: string): string;
export function bin_to_base64(data: string): string;
