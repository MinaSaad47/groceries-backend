import { Request, Response } from "express";
import { FavoritesService } from "../services/favorites.service";
import {
  CreateFavoriteInput,
  DeleteFavoriteInput,
  ItemResBody,
  UserResBody,
} from "@api/v1/models";

export const getAll = async (req: Request, res: Response<ItemResBody[]>) => {
  const user = req.user!;
  const items = await FavoritesService.getAll(user.user_id);
  return res.status(200).json(items);
};

export const addOne = async (
  req: Request<{}, {}, CreateFavoriteInput>,
  res: Response<ItemResBody>
) => {
  const user = req.user!;
  const itemId = req.body.item_id;
  const item = await FavoritesService.addOne(user.user_id, itemId);
  if (item) {
    return res.status(201).json(item);
  }
  return res.status(404).send();
};

export const deleteOne = async (
  req: Request<DeleteFavoriteInput, {}, {}>,
  res: Response<ItemResBody>
) => {
  const user = req.user!;
  const itemId = req.params.item_id;
  const item = await FavoritesService.deleteOne(user.user_id, itemId);
  if (item) {
    return res.status(200).json(item);
  }
  return res.status(404).send();
};
