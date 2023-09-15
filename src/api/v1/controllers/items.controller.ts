import { Request, Response } from "express";
import { ItemsService, ReviewsService } from "@api/v1/services";
import {
  CreateItemInput,
  GetItemInput,
  ItemOutput,
  UpdateItemInput,
  UserOutput,
} from "../models";
import { ReviewOutput, CreateReviewInput } from "../models/review.model";

export const getAll = async (req: Request, res: Response<ItemOutput[]>) => {
  const items = await ItemsService.getAll();
  res.success({ data: items });
};

export const createOne = async (
  req: Request<{}, {}, CreateItemInput>,
  res: Response<ItemOutput>
) => {
  const item = req.body;
  const createdItem = await ItemsService.createOne(item);
  return res.success({ code: 201, data: createdItem, i18n: { key: "item" } });
};

export const getOne = async (
  req: Request<GetItemInput, {}, {}>,
  res: Response<ItemOutput>
) => {
  const itemId = req.params.item_id;
  const item = await ItemsService.getOne(itemId);
  if (!item) {
    return res.fail({ code: 404, i18n: { key: "item", args: { id: itemId } } });
  }
  return res.success({ data: item });
};

export const deleteOne = async (
  req: Request<GetItemInput, {}, {}>,
  res: Response<ItemOutput>
) => {
  const itemId = req.params.item_id;
  const item = await ItemsService.deleteOne(itemId);
  if (!item) {
    return res.fail({ code: 404, i18n: { key: "item", args: { id: itemId } } });
  }
  res.success({ data: item, i18n: { key: "item.delete" } });
};

export const updateOne = async (
  req: Request<GetItemInput, {}, UpdateItemInput>,
  res: Response<ItemOutput>
) => {
  const itemId = req.params.item_id;
  const updatedItem = req.body;
  const item = await ItemsService.updateOne(itemId, updatedItem);
  if (!item) {
    return res.fail({ code: 404, i18n: { key: "item", args: { id: itemId } } });
  }
  res.success({ data: item, i18n: { key: "item.update" } });
};

export const addThumbnail = async (
  req: Request<GetItemInput>,
  res: Response<ItemOutput>
) => {
  const itemId = req.params.item_id;
  const thumbnail = req.file?.path;
  const item = await ItemsService.updateOne(itemId, { thumbnail });
  if (item) {
    return res.status(200).json(item);
  } else {
    return res.fail({ code: 404, i18n: { key: "item" } });
  }
};

export const addImage = async (
  req: Request<GetItemInput>,
  res: Response<ItemOutput>
) => {
  const itemId = req.params.item_id;
  const image = req.file?.path;
  const item = await ItemsService.addImage(itemId, image!);
  if (item) {
    return res.status(200).json(item);
  } else {
    return res.fail({ code: 404, i18n: { key: "item", args: { id: itemId } } });
  }
};

export const addReview = async (
  req: Request<GetItemInput, {}, CreateReviewInput>,
  res: Response<ReviewOutput>
) => {
  const user = req.user as UserOutput;
  const itemId = req.params.item_id;
  const userId = user.user_id;
  const review = req.body;
  const createdReview = await ReviewsService.addOne(itemId, userId, review);
  if (createdReview) {
    res.status(201).json(createdReview);
  } else {
    res.sendStatus(404);
  }
};

export const getAllReview = async (
  req: Request<GetItemInput>,
  res: Response<ReviewOutput[]>
) => {
  const itemId = req.params.item_id;
  const reviews = await ReviewsService.getAll({ itemId });
  res.status(200).json(reviews);
};
