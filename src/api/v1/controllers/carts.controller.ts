import { Request, Response } from "express";
import { CartsService } from "@api/v1/services";
import {
  CartAddItemBody,
  CartGetParam as CartGetParam,
  CartItemGetParam,
  CartUpdateItemBody as CartItemUpdateBody,
} from "../models";

export const getAll = async (req: Request, res: Response) => {
  const userId = req.user!.user_id;
  const carts = await CartsService.getAll(userId);
  return res.success({ data: carts });
};

export const createOne = async (req: Request, res: Response) => {
  const userId = req.user!.user_id;
  const cart = await CartsService.createOne(userId);
  if (!cart) {
    return res.fail({ i18n: { key: "cart" } });
  } else {
    return res.success({ code: 201, data: cart, i18n: { key: "cart" } });
  }
};

export const getOne = async (req: Request<CartGetParam>, res: Response) => {
  const userId = req.user!.user_id;
  const cartId = req.params.cart_id;
  const cart = await CartsService.getOne(cartId, userId);
  if (!cart) {
    return res.fail({
      code: 404,
      i18n: { key: "cart", args: { cartId, userId } },
    });
  } else {
    return res.success({ data: cart });
  }
};

export const deleteOne = async (req: Request<CartGetParam>, res: Response) => {
  const userId = req.user!.user_id;
  const cartId = req.params.cart_id;
  const cart = await CartsService.deleteOne(cartId, userId);
  if (!cart) {
    return res.fail({
      code: 404,
      i18n: { key: "cart", args: { cartId, userId } },
    });
  } else {
    return res.success({ data: cart });
  }
};

// TODO: check for user id
export const addItem = async (
  req: Request<CartGetParam,{}, CartAddItemBody>,
  res: Response
) => {
  const { cart_id} = req.params;
  const { item_id, quantity } = req.body;
  if (await CartsService.addItem(cart_id, item_id, quantity)) {
    return res.success({
      i18n: { key: "cart.item.add" },
    });
  } else {
    return res.fail({
      i18n: { key: "cart.item.add" },
    });
  }
};

// TODO: check for user id
export const removeItem = async (
  req: Request<CartItemGetParam>,
  res: Response
) => {
  const { item_id, cart_id } = req.params;
  if (await CartsService.removeItem(cart_id, item_id)) {
    return res.success({
      i18n: { key: "cart.item.remove" },
    });
  } else {
    return res.fail({
      i18n: { key: "cart.item.remove" },
    });
  }
};

// TODO: check for user id
export const updateItem = async (
  req: Request<CartItemGetParam, {}, CartItemUpdateBody>,
  res: Response
) => {
  const { cart_id, item_id } = req.params;
  const { quantity } = req.body;
  if (await CartsService.updateItem(cart_id, item_id, quantity)) {
    return res.success({
      i18n: { key: "cart.item.update" },
    });
  } else {
    return res.fail({
      i18n: { key: "cart.item.update" },
    });
  }
};
