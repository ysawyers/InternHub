/* Unique entity already exists */
export class DatabaseConflictException extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, DatabaseConflictException.prototype);
  }
}

/* Unauthorized User */
export class NotAuthorizedException extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, NotAuthorizedException.prototype);
  }
}

/* Invalid Request */
export class InvalidRequestException extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidRequestException.prototype);
  }
}

export const errorCode = (error: any): number => {
  if (error instanceof InvalidRequestException) {
    return 400;
  }

  if (error instanceof DatabaseConflictException) {
    return 409;
  }

  if (error instanceof NotAuthorizedException) {
    return 401;
  }

  /* Uncaught internal server error */
  return 500;
};
