import { Request, Response, Router } from "express";

import Controller from "@api/v1/utils/interfaces/controller.interface";
import { ItemsService } from "./items.service";
import {
  requireJwt,
  uploadItemImage,
  uploadItemThumbnail,
  validateRequest,
} from "@api/v1/middlewares";
import {
  CreateItem,
  CreateItemReview,
  CreateItemReviewSchema,
  CreateItemSchema,
  SelectItem,
  SelectItemSchema,
  UpdateItem,
  UpdateItemSchema,
} from "./items.validation";
import { z } from "zod";
import { bearerAuth, registry } from "@api/v1/utils/openapi/registery";

export class ItemsController implements Controller {
  public path: string;
  public router: Router;
  private itemService;

  constructor(path: string, itemService: ItemsService) {
    this.path = path;
    this.router = Router();
    this.itemService = itemService;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    registry.registerPath({
      tags: ["items"],
      path: "/items",
      method: "get",
      summary: "get all items",
      responses: {
        200: {
          description: "array of items",
        },
      },
    });

    registry.registerPath({
      tags: ["items"],
      path: "/items",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "create an item",
      request: {
        body: {
          content: { "application/json": { schema: CreateItemSchema } },
        },
      },
      responses: {
        201: {
          description: "created item",
        },
      },
    });

    registry.registerPath({
      tags: ["items"],
      path: "/items/{itemId}",
      method: "get",
      summary: "get an item",
      request: {
        params: SelectItemSchema,
      },
      responses: {
        200: {
          description: "item details",
        },
      },
    });

    registry.registerPath({
      tags: ["items"],
      path: "/items/{itemId}",
      method: "patch",
      security: [{ [bearerAuth.name]: [] }],
      summary: "update an item",
      request: {
        params: SelectItemSchema,
        body: { content: { "application/json": { schema: UpdateItemSchema } } },
      },
      responses: {
        200: {
          description: "update item",
        },
      },
    });

    registry.registerPath({
      tags: ["items"],
      path: "/items/{itemId}",
      method: "delete",
      summary: "delete an item",
      request: {
        params: SelectItemSchema,
      },
      responses: {
        200: {
          description: "deleted item",
        },
      },
    });

    registry.registerPath({
      tags: ["items"],
      path: "/items/{itemId}/image",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "upload an item image",
      request: {
        params: SelectItemSchema,
        body: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["image"],
                properties: {
                  image: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "uploaded image",
        },
      },
    });

    registry.registerPath({
      tags: ["items"],
      path: "/items/{itemId}/thumbnail",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "upload an item thumbnail",
      request: {
        params: SelectItemSchema,
        body: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["thumbnail"],
                properties: {
                  thumbnail: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "uploaded thumbnail",
        },
      },
    });

    registry.registerPath({
      tags: ["items"],
      path: "/items/{itemId}/reviews",
      method: "post",
      summary: "review an item",
      request: {
        params: SelectItemSchema,
        body: {
          content: {
            "application/json": {
              schema: CreateItemReviewSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "review",
        },
      },
    });

    this.router
      .route("/")
      .post(
        validateRequest(z.object({ body: CreateItemSchema })),
        this.createOne
      )
      .get(this.getAll);

    this.router
      .route("/:itemId")
      .all(validateRequest(z.object({ params: SelectItemSchema })))
      .get(this.getOne)
      .patch(
        validateRequest(z.object({ body: UpdateItemSchema })),
        this.updateOne
      )
      .delete(this.deleteOne);

    this.router
      .route("/:itemId/image")
      .all(validateRequest(z.object({ params: SelectItemSchema })))
      .post(uploadItemImage, this.addImage);

    this.router
      .route("/:itemId/thumbnail")
      .all(validateRequest(z.object({ params: SelectItemSchema })))
      .post(uploadItemThumbnail, this.uploadThumbnail);

    this.router
      .route("/:itemId/reviews")
      .all(
        validateRequest(
          z.object({ params: SelectItemSchema, body: CreateItemReviewSchema })
        )
      )
      .post(requireJwt, this.addReivew);
  }

  private createOne: RequestHandler<{}, CreateItem> = async (req, res) => {
    const item = await this.itemService.createOne(req.body);
    return res.success({ code: 201, data: item, i18n: { key: "items" } });
  };

  private getAll: RequestHandler = async (req, res) => {
    const items = await this.itemService.getAll();
    return res.success({ data: items });
  };

  private getOne: RequestHandler<SelectItem> = async (req, res) => {
    const item = await this.itemService.getOne(req.params.itemId);
    return res.success({ data: item });
  };

  private deleteOne: RequestHandler<SelectItem> = async (req, res) => {
    const item = await this.itemService.deleteOne(req.params.itemId);
    return res.success({ data: item, i18n: { key: "items.delete" } });
  };

  private updateOne: RequestHandler<SelectItem, UpdateItem> = async (
    req: Request,
    res: Response
  ) => {
    const item = await this.itemService.updateOne(req.params.itemId, req.body);
    return res.success({ data: item, i18n: { key: "items.update" } });
  };

  private addImage: RequestHandler<SelectItem> = async (req, res) => {
    let image = req.file?.path;
    image = await this.itemService.addImage(req.params.itemId, image!);
    return res.success({
      code: 201,
      data: image,
      i18n: { key: "items.image" },
    });
  };

  private addReivew: RequestHandler<SelectItem, CreateItemReview> = async (
    req,
    res
  ) => {
    const reivew = await this.itemService.addReview(
      req.params.itemId,
      req.user!.id,
      req.body
    );
    return res.success({ code: 201, data: reivew, i18n: { key: "reviews" } });
  };

  private uploadThumbnail: RequestHandler<SelectItem> = async (req, res) => {
    let thumbnail = req.file?.path ?? null;

    thumbnail = await this.itemService.addThumbnail(
      req.params.itemId,
      thumbnail!
    );

    return res.success({
      data: thumbnail,
      i18n: { key: "items.update" },
    });
  };
}
