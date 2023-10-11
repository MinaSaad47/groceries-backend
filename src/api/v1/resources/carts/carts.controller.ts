import { requireJwt, validateRequest } from "@api/v1/middlewares";
import Controller from "@api/v1/utils/interfaces/controller.interface";
import { bearerAuth, registry } from "@api/v1/utils/openapi/registery";
import { Request, Response, Router } from "express";
import { z } from "zod";
import { QueryLang, QueryLangSchema } from "../items/items.validation";
import { CartsService } from "./carts.service";
import {
  CreateCartToItem,
  CreateCartToItemSchema,
  SelectCart,
  SelectCartSchema,
  SelectCartToItem,
  SelectCartToItemSchema,
  UpdateCartToItem,
  UpdateCartToItemSchema,
} from "./carts.validation";

export class CartsController implements Controller {
  public path: string;
  public router: Router;
  private cartsService: CartsService;

  constructor(path: string, cartsService: CartsService) {
    this.path = path;
    this.router = Router();
    this.cartsService = cartsService;

    this.initializeRoutes();
  }

  private initializeRoutes() {
    registry.registerPath({
      tags: ["carts"],
      path: "/profile/carts",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "create a cart",
      responses: {
        201: {
          description: "created cart",
        },
      },
    });

    registry.registerPath({
      tags: ["carts"],
      path: "/profile/carts",
      method: "get",
      security: [{ [bearerAuth.name]: [] }],
      summary: "get all cart for the sigend profile",
      responses: {
        200: {
          description: "created cart",
        },
      },
    });

    registry.registerPath({
      tags: ["carts"],
      path: "/profile/carts/{cartId}",
      method: "get",
      security: [{ [bearerAuth.name]: [] }],
      summary: "get details about specific cart",
      request: {
        params: SelectCartSchema,
      },
      parameters: [
        {
          in: "query",
          schema: {
            type: "string",
          },
          name: "lang",
          description: "value from 'ar', 'en'",
        },
      ],
      responses: {
        200: {
          description: "created cart",
        },
      },
    });

    registry.registerPath({
      tags: ["carts"],
      path: "/profile/carts/{cartId}/checkout",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "checkout the cart and create order",
      request: {
        params: SelectCartSchema,
      },
      responses: {
        200: {
          description:
            "stripe publishable key, client secret and order details",
        },
      },
    });

    registry.registerPath({
      tags: ["carts"],
      path: "/profile/carts/{cartId}/items",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "add item to cart",
      request: {
        params: SelectCartSchema,
        body: {
          content: {
            "application/json": {
              schema: CreateCartToItemSchema,
            },
          },
        },
      },
      responses: {
        201: {
          description: "added item",
        },
      },
    });

    registry.registerPath({
      tags: ["carts"],
      path: "/profile/carts/{cartId}/items/{itemId}",
      method: "patch",
      security: [{ [bearerAuth.name]: [] }],
      summary: "update item in cart",
      request: {
        params: SelectCartToItemSchema,
        body: {
          content: {
            "application/json": {
              schema: UpdateCartToItemSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "updated item",
        },
      },
    });

    registry.registerPath({
      tags: ["carts"],
      path: "/profile/carts/{cartId}/items/{itemId}",
      method: "delete",
      security: [{ [bearerAuth.name]: [] }],
      summary: "remove item from cart",
      request: {
        params: SelectCartToItemSchema,
      },
      responses: {
        200: {
          description: "deleted item",
        },
      },
    });

    this.router.use(requireJwt);
    this.router.route("/").post(this.createOne).get(this.getAll);

    this.router
      .route("/:cartId")
      .all(
        validateRequest(
          z.object({ params: SelectCartSchema, query: QueryLangSchema })
        )
      )
      .get(this.getOne);
    this.router
      .route("/:cartId/checkout")
      .all(validateRequest(z.object({ params: SelectCartSchema })))
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
      .delete(this.deleteItem)
      .patch(
        validateRequest(z.object({ body: UpdateCartToItemSchema })),
        this.updateItem
      );
  }

  private createOne = async (req: Request, res: Response) => {
    const cart = await this.cartsService.createOne(req.user!.id);
    res.success({ code: 201, data: cart, i18n: { key: "cart" } });
  };

  private getOne: RequestHandler<SelectCart, {}, QueryLang> = async (
    req,
    res
  ) => {
    const cart = await this.cartsService.getOne(
      req.user!,
      req.params.cartId,
      req.query
    );
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
      req.body.qty
    );

    res.success({ code: 201, data: item, i18n: { key: "cart.item" } });
  };

  private checkout: RequestHandler<SelectCart> = async (req, res) => {
    const order = await this.cartsService.checkout(
      req.user!,
      req.params.cartId
    );

    res.success({
      data: order,
    });
  };

  private updateItem: RequestHandler<SelectCartToItem, UpdateCartToItem> =
    async (req, res) => {
      const item = await this.cartsService.updateItem(
        req.user!,
        req.params.cartId,
        req.params.itemId,
        req.body.qty
      );

      res.success({ code: 200, data: item, i18n: { key: "cart.item.update" } });
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
