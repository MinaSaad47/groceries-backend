import { Request, Response } from "express";
import { CategoriesService } from "@api/v1/services";
import {
  CreateCategoryInput,
  GetCategoryInput,
  CategoryOutput,
  UpdateCategoryInput,
} from "../models";

export const addImage = async (
  req: Request<GetCategoryInput>,
  res: Response<CategoryOutput>
) => {
  const image = req.file?.path;
  const categoryId = req.params.category_id;
  const category = await CategoriesService.updateOne(categoryId, { image });
  if (category) {
    return res.status(200).json(category);
  } else {
    return res.status(404).send();
  }
};

export const getAll = async (req: Request, res: Response<CategoryOutput[]>) => {
  const result = await CategoriesService.getAll();
  res.status(200).json(result);
};

export const createOne = async (
  req: Request<{}, {}, CreateCategoryInput>,
  res: Response<CategoryOutput>
) => {
  const { name } = req.body;
  const createdCategory = await CategoriesService.createOne(name);
  return res.status(201).json(createdCategory);
};

export const getOne = async (
  req: Request<GetCategoryInput, {}, {}>,
  res: Response<CategoryOutput>
) => {
  const categoryId = req.params.category_id;
  const category = await CategoriesService.getOne(categoryId);
  if (!category) {
    return res.status(404).send();
  }
  return res.status(200).json(category);
};

export const deleteOne = async (
  req: Request<GetCategoryInput, {}, {}>,
  res: Response<CategoryOutput>
) => {
  const categoryId = req.params.category_id;
  const category = await CategoriesService.deleteOne(categoryId);
  if (!category) {
    return res.status(404).send();
  }
  res.status(200).json(category);
};

export const updateOne = async (
  req: Request<GetCategoryInput, {}, UpdateCategoryInput>,
  res: Response<CategoryOutput>
) => {
  const categoryId = req.params.category_id;
  const category = req.body;
  const updatedCategory = await CategoriesService.updateOne(
    categoryId,
    category
  );
  if (!updatedCategory) {
    return res.status(404).send();
  }
  res.status(200).json(updatedCategory);
};
