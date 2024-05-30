declare interface utf8_validator {
	(value: string): value is string;
}
declare const utf8_validator: utf8_validator;
export = utf8_validator;
