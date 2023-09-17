import { Pool } from "pg";
import {
  UserCreateBody,
  UserUpdateBody,
  UserResBody,
  UserResBodySchema,
} from "@api/v1/models";

export class UsersService {
  private static pool: Pool;

  static setPool(pool: Pool) {
    UsersService.pool = pool;
  }

  static async getAll(): Promise<UserResBody[]> {
    const result = await this.pool.query("SELECT * FROM users");
    return result.rows.map((user) => UserResBodySchema.parse(user));
  }

  static async findByEmail(email: string): Promise<UserResBody | null> {
    const result = await this.pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    return user && UserResBodySchema.parse(user);
  }

  static async createOne(user: UserCreateBody): Promise<UserResBody> {
    const query = `
        INSERT INTO users (first_name, last_name, email, phone_number, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
        `;
    const values = [
      user.first_name,
      user.last_name,
      user.email,
      user.phone_number,
      user.role,
    ];
    const result = await this.pool.query(query, values);
    const createdUser = result.rows[0];
    return createdUser && UserResBodySchema.parse(createdUser);
  }

  static async getOne(userId: string): Promise<UserResBody | null> {
    const result = await this.pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userId]
    );
    const user = result.rows[0];
    return user && UserResBodySchema.parse(user);
  }

  static async deleteOne(userId: string): Promise<UserResBody | null> {
    const result = await this.pool.query(
      "DELETE FROM users WHERE user_id = $1  RETURNING *",
      [userId]
    );
    const deletedUser = result.rows[0];
    return deletedUser && UserResBodySchema.parse(deletedUser);
  }

  static async updateOne(
    userId: string,
    user: UserUpdateBody
  ): Promise<UserResBody | null> {
    const query = `
    UPDATE users
    SET
        first_name = COALESCE(NULLIF($1, ''), first_name),
        last_name = COALESCE(NULLIF($2, ''), last_name),
        email = COALESCE(NULLIF($3, ''), email),
        profile_picture = COALESCE(NULLIF($4, ''), profile_picture),
        role = COALESCE(NULLIF($5, ''), role::text)::user_role
    WHERE user_id = $6
    RETURNING *;
    `;
    const values = [
      user.first_name,
      user.last_name,
      user.email,
      user.profile_picture,
      user.role,
      userId,
    ];
    const result = await this.pool.query(query, values);
    const updatedUser = result.rows[0];
    return updatedUser && UserResBodySchema.parse(updatedUser);
  }
}
