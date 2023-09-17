import { Request, Response } from "express";
import {
  UserCreateBody,
  UserGetParam,
  UserUpdateBody,
  UserResBody,
} from "@api/v1/models";
import { UsersService } from "@api/v1/services";

export const createOne = async (
  req: Request<{}, {}, UserCreateBody>,
  res: Response<UserResBody>
) => {
  const createdUser = req.body;
  const user = await UsersService.createOne(createdUser);
  return res.success({ data: user, code: 201, i18n: { key: "user" } });
};

export const getAll = async (req: Request, res: Response<UserResBody[]>) => {
  const users = await UsersService.getAll();
  return res.success({ data: users });
};

export const getOne = async (
  req: Request<UserGetParam, {}, {}>,
  res: Response<UserResBody>
) => {
  const userId = req.params.user_id;
  const user = await UsersService.getOne(userId);
  if (!user) {
    return res.fail({ code: 404, i18n: { key: "user", args: { id: userId } } });
  }
  return res.success({ data: user });
};

export const updateOne = async (
  req: Request<UserGetParam, {}, UserUpdateBody>,
  res: Response<UserResBody>
) => {
  const userId = req.params.user_id;
  const updatedUser = req.body;
  const user = await UsersService.updateOne(userId, updatedUser);
  if (!user) {
    return res.fail({ code: 404, i18n: { key: "user", args: { id: userId } } });
  }
  return res.success({ data: user, i18n: { key: "user.update" } });
};

export const deleteOne = async (
  req: Request<UserGetParam, {}, {}>,
  res: Response<UserResBody>
) => {
  const userId = req.params.user_id;
  const user = await UsersService.deleteOne(userId);
  if (!user) {
    return res.fail({ code: 404, i18n: { key: "user", args: { id: userId } } });
  }
  return res.success({ data: user, i18n: { key: "user.delete" } });
};
