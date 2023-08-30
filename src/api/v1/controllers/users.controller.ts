import { Request, Response } from "express";
import {
  CreateUserInput,
  GetUserInput,
  UpdateUserInput,
  UserOutput,
} from "@api/v1/models";
import { UsersService } from "@api/v1/services";

export const createOne = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response<UserOutput>
) => {
  const createdUser = req.body;
  const user = await UsersService.createOne(createdUser);
  return res.status(201).json(user);
};

export const getAll = async (req: Request, res: Response<UserOutput[]>) => {
  const users = await UsersService.getAll();
  return res.status(200).json(users);
};

export const getOne = async (
  req: Request<GetUserInput, {}, {}>,
  res: Response<UserOutput>
) => {
  const userId = req.params.user_id;
  const user = await UsersService.getOne(userId);
  if (!user) {
    return res.status(404).send();
  }
  return res.status(200).json(user);
};

export const updateOne = async (
  req: Request<GetUserInput, {}, UpdateUserInput>,
  res: Response<UserOutput>
) => {
  const userId = req.params.user_id;
  const updatedUser = req.body;
  const user = await UsersService.updateOne(userId, updatedUser);
  if (!user) {
    return res.status(404).send();
  }
  return res.status(200).json(user);
};

export const deleteOne = async (
  req: Request<GetUserInput, {}, {}>,
  res: Response<UserOutput>
) => {
  const userId = req.params.user_id;
  const user = await UsersService.deleteOne(userId);
  if (!user) {
    return res.status(404).send();
  }
  return res.status(200).json(user);
};
