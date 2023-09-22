import { requireJwt, validateRequest } from "@api/v1/middlewares";
import Controller from "@api/v1/utils/interfaces/controller.interface";
import { Request, Response, Router } from "express";
import { CartsService } from "./carts.service";
import { PaymentService } from "@api/v1/services/payment.service";
import { omit } from "lodash";
import {
  CreateCartToItem,
  CreateCartToItemSchema,
  SelectCart,
  SelectCartSchema,
  SelectCartToItem,
  SelectCartToItemSchema,
} from "./carts.validation";
import { z } from "zod";

export class CartsController implements Controller {
  public path: string;
  public router: Router;
  private cartsService: CartsService;

  constructor(path: string, cartsService: CartsService) {
    this.path = path;
    this.router = Router();
    this.cartsService = cartsService;
    this.router.use(requireJwt);

    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route("/").post(this.createOne).get(this.getAll);

    this.router
      .route("/:cartId")
      .all(validateRequest(z.object({ params: SelectCartToItemSchema })))
      .get(this.getOne);
    this.router
      .route("/:cartId/checkout")
      .all(validateRequest(z.object({ params: SelectCartToItemSchema })))
      .post(this.checkout);

    this.router
      .route("/:cartId/items")
      .all(
        validateRequest(
          z.object({ params: SelectCartSchema, body: CreateCartToItemSchema })
        )
      )
      .post(this.addItem);

    this.router
      .route("/:cartId/items/:itemId")
      .all(validateRequest(z.object({ params: SelectCartToItemSchema })))
      .delete(this.deleteItem);

    this.router
      .route("/:cartId/order")
      .all(validateRequest(z.object({ params: SelectCartSchema })))
      .delete(this.cancelOrder);
  }

  private createOne = async (req: Request, res: Response) => {
    const cart = await this.cartsService.createOne(req.user!.id);
    res.success({ code: 201, data: cart, i18n: { key: "cart" } });
  };

  private getOne: RequestHandler<SelectCart> = async (req, res) => {
    const cart = await this.cartsService.getOne(req.user!, req.params.cartId);
    if (cart?.userId !== req.user?.id) {
      res.fail({ code: 404, i18n: { key: "cart" } });
    } else {
      res.success({ data: cart });
    }
  };

  private getAll = async (req: Request, res: Response) => {
    const carts = await this.cartsService.getAll(req.user!.id);
    res.success({ data: carts });
  };

  private addItem: RequestHandler<SelectCart, CreateCartToItem> = async (
    req,
    res
  ) => {
    const item = await this.cartsService.addItem(
      req.user!,
      req.params.cartId,
      req.body.itemId,
      req.body.quantity
    );

    res.success({ code: 201, data: item, i18n: { key: "cart.item" } });
  };

  private checkout: RequestHandler<SelectCart> = async (req, res) => {
    const order = await this.cartsService.createOrder(
      req.user!,
      req.params.cartId
    );

    res.success({
      data: order,
    });
  };

  private cancelOrder: RequestHandler<SelectCart> = async (req, res) => {
    const order = await this.cartsService.deleteOrder(
      req.user!,
      req.params.cartId
    );

    res.success({ data: order, i18n: { key: "orders.cancel" } });
  };

  private deleteItem: RequestHandler<SelectCartToItem> = async (req, res) => {
    await this.cartsService.deleteItem(
      req.user!,
      req.params.cartId,
      req.params.itemId
    );

    res.success({ i18n: { key: "carts.items.delete" } });
  };
}
