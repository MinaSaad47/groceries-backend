import { Request, Response } from "express";
import { UsersService } from "../services";
import { UserUpdateBody, UserResBody } from "../models";

export const addPicture = async (req: Request, res: Response) => {
  let user = req.user!;
  const path = req.file?.path;
  const updatedUser = await UsersService.updateOne(user.user_id, {
    profile_picture: path,
  });
  res.status(200).json(updatedUser);
};

export const getProfile = async (req: Request, res: Response<UserResBody>) => {
  const user = req.user!;
  return res.status(200).json(user);
};

export const updateProfile = async (
  req: Request<{}, {}, UserUpdateBody>,
  res: Response<UserResBody | null>
) => {
  const user = req.user!;
  const updatedUser = await UsersService.updateOne(user.user_id, req.body);
  return res.status(200).json(updatedUser);
};
