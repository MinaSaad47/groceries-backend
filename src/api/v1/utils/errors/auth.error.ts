import { BaseError } from "./base.error";

export class AuthorizationError extends BaseError {
  name: string = "AuthorizationError";

  constructor(resource: "cart" | "item", userId: string, resourceId: string) {
    super(
      401,
      `${resource}(${resourceId}) can't be accessed by user(${userId})`,
      { key: resource, args: { userId, resourceId } }
    );

    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}
