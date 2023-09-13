import { Pool } from "pg";
import { ReviewOutput, ReviewOutputSchema } from "../models/review.model";
import { CreateReviewInput } from "../models/review.model";

export class ReviewsService {
  private static pool: Pool;

  static setPool(pool: Pool) {
    ReviewsService.pool = pool;
  }

  static async getAll({
    itemId,
    userId,
  }: {
    itemId?: string;
    userId?: string;
  }): Promise<ReviewOutput[]> {
    const result = await this.pool.query("SELECT * FROM reviews_view");
    return result.rows.map((item) => ReviewOutputSchema.parse(item));
  }

  static async addOne(
    itemId: string,
    userId: string,
    review: CreateReviewInput
  ): Promise<ReviewOutput | null> {
    const query = `
      INSERT INTO reviews (item_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
      `;

    const result = await this.pool.query(query, [
      itemId,
      userId,
      review.rating,
      review.comment,
    ]);
    const createdReview = result.rows[0];
    return createdReview && ReviewOutputSchema.parse(createdReview);
  }

  static async deleteOne(reviewId: string): Promise<ReviewOutput | null> {
    const query = `
      DROP FROM reviews
      WHERE review_id = $1
      RETURNING *;
      `;
    const result = await this.pool.query(query, [reviewId]);
    const deleteReview = result.rows[0];
    return deleteReview && ReviewOutputSchema.parse(deleteReview);
  }
}
