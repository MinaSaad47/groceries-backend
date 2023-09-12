import { Request, Response } from "express";
import { UsersService } from "../services";
import { UpdateUserInput, UserOutput } from "../models";

export const addPicture = async (req: Request, res: Response) => {
  let user = req.user as UserOutput;
  const path = req.file?.path;
  const updatedUser = await UsersService.updateOne(user.user_id, {
    profile_picture: path,
  });
  res.status(200).json(updatedUser);
};

export const getProfile = async (req: Request, res: Response<UserOutput>) => {
  const user = req.user as UserOutput;
  return res.status(200).json(user);
};

export const updateProfile = async (
  req: Request<{}, {}, UpdateUserInput>,
  res: Response<UserOutput | null>
) => {
  const user = req.user as UserOutput;
  const updatedUser = await UsersService.updateOne(user.user_id, req.body);
  return res.status(200).json(updatedUser);
};
