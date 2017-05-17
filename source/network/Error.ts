import { BaseError } from '../system/BaseError';

export class Unauthorized extends BaseError {}

export class Forbidden extends BaseError {}

export class NotFound extends BaseError {}
