import { Request, Response } from "express";
import { AddressesService } from "../services";
import { CreateAddressInput, UserResBody } from "../models";

export const getAll = async (req: Request, res: Response) => {
  const user = req.user!;
  const addresses = await AddressesService.getAll(user.user_id);
  return res.status(200).json(addresses);
};

export const createOne = async (
  req: Request<{}, {}, CreateAddressInput>,
  res: Response
) => {
  const user = req.user!;
  const address = req.body;
  const createdAddress = await AddressesService.addOne(user.user_id, address);
  return res.status(201).json(createdAddress);
};

export const deleteOne = async (req: Request, res: Response) => {
  const { address_id } = req.params;
  const deletedAddress = await AddressesService.deleteOne(address_id);
  return res.status(200).json(deletedAddress);
};
