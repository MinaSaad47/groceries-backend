import { Request, Response } from "express";
import { ItemsService } from "@api/v1/services";
import {
  CreateItemInput,
  GetItemInput,
  ItemOutput,
  UpdateItemInput,
} from "../models";

export const getAll = async (req: Request, res: Response<ItemOutput[]>) => {
  const result = await ItemsService.getAll();
  res.status(200).json(result);
};

export const createOne = async (
  req: Request<{}, {}, CreateItemInput>,
  res: Response<ItemOutput>
) => {
  const item = req.body;
  const createdItem = await ItemsService.createOne(item);
  return res.status(201).json(createdItem);
};

export const getOne = async (
  req: Request<GetItemInput, {}, {}>,
  res: Response<ItemOutput>
) => {
  const itemId = req.params.item_id;
  const item = await ItemsService.getOne(itemId);
  if (!item) {
    return res.status(404).send();
  }
  return res.status(200).json(item);
};

export const deleteOne = async (
  req: Request<GetItemInput, {}, {}>,
  res: Response<ItemOutput>
) => {
  const itemId = req.params.item_id;
  const item = await ItemsService.deleteOne(itemId);
  if (!item) {
    return res.status(404).send();
  }
  res.status(200).json(item);
};

export const updateOne = async (
  req: Request<GetItemInput, {}, UpdateItemInput>,
  res: Response<ItemOutput>
) => {
  const itemId = req.params.item_id;
  const updatedItem = req.body;
  const item = await ItemsService.updateOne(itemId, updatedItem);
  if (!item) {
    return res.status(404).send();
  }
  res.status(200).json(item);
};
