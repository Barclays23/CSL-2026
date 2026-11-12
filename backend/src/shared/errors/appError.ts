export class AppError extends Error {
  readonly statusCode: number;
  readonly errorCode?: string;
  readonly fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    statusCode = 500,
    options: {
      errorCode?: string;
      fieldErrors?: Record<string, string>;
    } = {},
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errorCode = options.errorCode;
    this.fieldErrors = options.fieldErrors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
