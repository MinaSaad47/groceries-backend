import { Request, Response } from "express";
import { BrandsService } from "@api/v1/services"; // Update the import based on your BrandsService
import {
  CreateBrandInput,
  GetBrandInput,
  BrandOutput,
  UpdateBrandInput,
} from "../models"; // Update the imports based on your Brand models

export const getAll = async (req: Request, res: Response<BrandOutput[]>) => {
  const result = await BrandsService.getAll();
  res.status(200).json(result);
};

export const createOne = async (
  req: Request<{}, {}, CreateBrandInput>,
  res: Response<BrandOutput>
) => {
  const { name } = req.body;
  const createdBrand = await BrandsService.createOne(name);
  return res.status(201).json(createdBrand);
};

export const getOne = async (
  req: Request<GetBrandInput, {}, {}>,
  res: Response<BrandOutput>
) => {
  const brandId = req.params.brand_id;
  const brand = await BrandsService.getOne(brandId);
  if (!brand) {
    return res.status(404).send();
  }
  return res.status(200).json(brand);
};

export const deleteOne = async (
  req: Request<GetBrandInput, {}, {}>,
  res: Response<BrandOutput>
) => {
  const brandId = req.params.brand_id;
  const brand = await BrandsService.deleteOne(brandId);
  if (!brand) {
    return res.status(404).send();
  }
  res.status(200).json(brand);
};

export const updateOne = async (
  req: Request<GetBrandInput, {}, UpdateBrandInput>,
  res: Response<BrandOutput>
) => {
  const brandId = req.params.brand_id;
  const updatedBrand = req.body;
  const brand = await BrandsService.updateOne(brandId, updatedBrand);
  if (!brand) {
    return res.status(404).send();
  }
  res.status(200).json(brand);
};
