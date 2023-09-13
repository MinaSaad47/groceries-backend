import { Request, Response } from "express";
import { GetReviewInput, ReviewOutput } from "../models";
import { ReviewsService } from "../services";

export const deleteOne = async (
  req: Request<GetReviewInput>,
  res: Response<ReviewOutput>
) => {
  const reviewId = req.params.review_id;
  const deleteReview = await ReviewsService.deleteOne(reviewId);
  if (deleteReview) {
    return res.status(200).json(deleteReview);
  }
  {
    return res.sendStatus(404);
  }
};
