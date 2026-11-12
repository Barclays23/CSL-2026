export class AppError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public errorCode = "INTERNAL_SERVER_ERROR",
    public fieldErrors?: Record<string,string>
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
