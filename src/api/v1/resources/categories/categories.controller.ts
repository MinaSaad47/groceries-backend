import { Router } from "express";
import Controller from "../../utils/interfaces/controller.interface";
import { Database } from "../../db";
import {
  CreateCategory,
  CreateCategorySchema,
  SelectCategory,
  SelectCategorySchema,
  UpdateCategory,
  UpdateCategorySchema,
} from "./categories.validation";
import { CategoriesService } from "./categories.serivce";
import {
  authorizeRoles,
  requireJwt,
  uploadCategoryImage,
  validateRequest,
} from "../../middlewares";
import { z } from "zod";
import { bearerAuth, registry } from "@api/v1/utils/openapi/registery";

export class CategoriesController implements Controller {
  path: string;
  router: Router;

  constructor(path: string, private categoriesService: CategoriesService) {
    this.path = path;
    this.router = Router();
    this.intiailizeRoutes();
  }

  private intiailizeRoutes(): void {
    registry.registerPath({
      tags: ["categories"],
      path: "/categories",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "create a category",
      request: {
        body: {
          content: { "application/json": { schema: CreateCategorySchema } },
        },
      },
      responses: {
        201: {
          description: "created category",
        },
      },
    });

    registry.registerPath({
      tags: ["categories"],
      method: "get",
      summary: "get all categories",
      path: "/categories",
      responses: { 200: { description: "array of categories" } },
    });

    registry.registerPath({
      tags: ["categories"],
      path: "/categories/{categoryId}",
      method: "patch",
      security: [{ [bearerAuth.name]: [] }],
      summary: "update specific category",
      request: {
        params: SelectCategorySchema,
        body: {
          content: { "application/json": { schema: UpdateCategorySchema } },
        },
      },
      responses: {
        200: {
          description: "updated category",
        },
      },
    });

    registry.registerPath({
      tags: ["categories"],
      path: "/categories/{categoryId}",
      method: "delete",
      security: [{ [bearerAuth.name]: [] }],
      summary: "delete specific category",
      request: {
        params: SelectCategorySchema,
      },
      responses: {
        200: {
          description: "deleted category",
        },
      },
    });

    registry.registerPath({
      tags: ["categories"],
      path: "/categories/{categoryId}/image",
      method: "post",
      summary: "upload category image",
      security: [{ [bearerAuth.name]: [] }],
      request: {
        params: SelectCategorySchema,
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
          description: "deleted category",
        },
      },
    });

    registry.registerPath({
      tags: ["categories"],
      path: "/categories/{categoryId}/items",
      method: "get",
      summary: "get all items for this category",
      request: {
        params: SelectCategorySchema,
      },
      responses: {
        200: {
          description: "array of items",
        },
      },
    });

    this.router.use(requireJwt);

    this.router
      .route("/")
      .get(this.getAll)
      .post(
        [
          authorizeRoles("admin"),
          validateRequest(z.object({ body: CreateCategorySchema })),
        ],
        this.addOne
      );

    this.router
      .route("/:categoryId")
      .all(validateRequest(z.object({ params: SelectCategorySchema })))
      .delete(authorizeRoles("admin"), this.deleteOne)
      .patch(
        [
          authorizeRoles("admin"),
          validateRequest(z.object({ body: UpdateCategorySchema })),
        ],
        this.updateOne
      );

    this.router
      .route("/:categoryId/image")
      .all([
        authorizeRoles("admin"),
        validateRequest(z.object({ params: SelectCategorySchema })),
      ])
      .post(uploadCategoryImage, this.uploadImage);

    this.router
      .route("/:categoryId/items")
      .all(validateRequest(z.object({ params: SelectCategorySchema })))
      .get(this.getAllItems);
  }

  private addOne: RequestHandler<{}, CreateCategory> = async (req, res) => {
    const category = await this.categoriesService.addOne(req.body);
    return res.success({
      code: 201,
      data: category,
      i18n: { key: "categories" },
    });
  };

  private getAll: RequestHandler = async (req, res) => {
    const categories = await this.categoriesService.getAll();
    return res.success({ data: categories });
  };

  private deleteOne: RequestHandler<SelectCategory> = async (req, res) => {
    const category = await this.categoriesService.deleteOne(
      req.params.categoryId
    );
    return res.success({ data: category, i18n: { key: "categories.delete" } });
  };

  private updateOne: RequestHandler<SelectCategory, UpdateCategory> = async (
    req,
    res
  ) => {
    const category = await this.categoriesService.updateOne(
      req.params.categoryId,
      req.body
    );
    res.success({ data: category, i18n: { key: "categories.update" } });
  };

  private uploadImage: RequestHandler<SelectCategory> = async (req, res) => {
    const image = req.file?.path;
    const category = await this.categoriesService.updateOne(
      req.params.categoryId,
      { image }
    );
    return res.success({ data: category, i18n: { key: "categories.update" } });
  };

  private getAllItems: RequestHandler<SelectCategory> = async (req, res) => {
    const category = await this.categoriesService.getOne(req.params.categoryId);
    return res.success({ data: category.items });
  };
}
