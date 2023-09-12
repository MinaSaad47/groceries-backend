import { Pool } from "pg";
import logger from "../utils/logger";
import {
  AddressOutput,
  AddressOutputSchema,
  CreateAddressInput,
} from "@api/v1/models";

export class AddressesService {
  private static pool: Pool;

  static setPool(pool: Pool) {
    AddressesService.pool = pool;
  }

  static async getAll(userId: string): Promise<AddressOutput[]> {
    const query = `
      SELECT * FROM addresses
      WHERE user_id = $1;
    `;

    const result = await AddressesService.pool.query(query, [userId]);
    return result.rows.map((address) => AddressOutputSchema.parse(address));
  }

  static async addOne(
    userId: string,
    address: CreateAddressInput
  ): Promise<AddressOutput | null> {
    const query = `
      INSERT INTO addresses (user_id, building_number, apartment_number, floor_number, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *; `;

    const {
      building_number,
      apartment_number,
      floor_number,
      latitude,
      longitude,
    } = address;

    const result = await AddressesService.pool.query(query, [
      userId,
      building_number,
      apartment_number,
      floor_number,
      latitude,
      longitude,
    ]);
    const createdAddress = result.rows[0];
    return createdAddress && AddressOutputSchema.parse(createdAddress);
  }

  static async deleteOne(addressId: string): Promise<AddressOutput | null> {
    const query = `
      DELETE FROM addresses
      WHERE address_id = $1
      RETURNING *;
    `;

    const result = await AddressesService.pool.query(query, [addressId]);
    const deletedAddress = result.rows[0];
    return deletedAddress && AddressOutputSchema.parse(deletedAddress);
  }
}
