import { BaseError } from "@api/v1/utils/errors/base.error";

export class ItemAvailabilityError extends BaseError {
  constructor(requestdQty: number, stockQty: number) {
    super(
      422,
      `the requested quantiy '${requestdQty}' exceeds the stock quantity '${stockQty}'`,
      {
        key: "items.availability",
        args: { quantity: requestdQty, stock: stockQty },
      }
    );

    Object.setPrototypeOf(this, ItemAvailabilityError.prototype);
  }
}
