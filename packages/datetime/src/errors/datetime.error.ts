export class DateTimeError extends Error {
  readonly code: string;

  constructor(message: string, code = 'DATETIME_ERROR') {
    super(message);
    this.name = 'DateTimeError';
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
