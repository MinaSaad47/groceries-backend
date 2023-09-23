import { Router } from "express";
import Controller from "../../utils/interfaces/controller.interface";
import {
  CreateBrand,
  CreateBrandSchema,
  SelectBrand,
  SelectBrandSchema,
  UpdateBrand,
  UpdateBrandSchema,
} from "./brands.validation";
import { authorizeRoles, requireJwt, validateRequest } from "../../middlewares";
import { z } from "zod";
import { bearerAuth, registry } from "@api/v1/utils/openapi/registery";
import { BrandsService } from "./brands.serivce";

export class BrandsController implements Controller {
  path: string;
  router: Router;

  constructor(path: string, private brandsService: BrandsService) {
    this.path = path;
    this.router = Router();
    this.intiailizeRoutes();
  }

  private intiailizeRoutes(): void {
    registry.registerPath({
      tags: ["brands"],
      path: "/brands",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "create a brand",
      request: {
        body: {
          content: { "application/json": { schema: CreateBrandSchema } },
        },
      },
      responses: {
        201: {
          description: "created brand",
        },
      },
    });

    registry.registerPath({
      tags: ["brands"],
      method: "get",
      summary: "get all brands",
      path: "/brands",
      responses: { 200: { description: "array of brands" } },
    });

    registry.registerPath({
      tags: ["brands"],
      path: "/brands/{brandId}",
      method: "patch",
      security: [{ [bearerAuth.name]: [] }],
      summary: "update specific brand",
      request: {
        params: SelectBrandSchema,
        body: {
          content: { "application/json": { schema: UpdateBrandSchema } },
        },
      },
      responses: {
        200: {
          description: "updated brand",
        },
      },
    });

    registry.registerPath({
      tags: ["brands"],
      path: "/brands/{brandId}",
      method: "delete",
      security: [{ [bearerAuth.name]: [] }],
      summary: "delete specific brand",
      request: {
        params: SelectBrandSchema,
      },
      responses: {
        200: {
          description: "deleted brand",
        },
      },
    });

    registry.registerPath({
      tags: ["brands"],
      path: "/brands/{brandId}/items",
      method: "get",
      summary: "get all items for this brand",
      request: {
        params: SelectBrandSchema,
      },
      responses: {
        200: {
          description: "array of items",
        },
      },
    });

    this.router.use([requireJwt]);

    this.router
      .route("/")
      .get(this.getAll)
      .post(
        [
          authorizeRoles("admin"),
          validateRequest(z.object({ body: CreateBrandSchema })),
        ],
        this.addOne
      );

    this.router
      .route("/:brandId")
      .all([
        authorizeRoles("admin"),
        validateRequest(z.object({ params: SelectBrandSchema })),
      ])
      .delete(this.deleteOne)
      .patch(
        validateRequest(z.object({ body: UpdateBrandSchema })),
        this.updateOne
      );

    this.router
      .route("/:brandId/items")
      .all(validateRequest(z.object({ params: SelectBrandSchema })))
      .get(this.getAllItems);
  }

  private addOne: RequestHandler<{}, CreateBrand> = async (req, res) => {
    const brand = await this.brandsService.addOne(req.body);
    return res.success({
      code: 201,
      data: brand,
      i18n: { key: "brands" },
    });
  };

  private getAll: RequestHandler = async (req, res) => {
    const categories = await this.brandsService.getAll();
    return res.success({ data: categories });
  };

  private deleteOne: RequestHandler<SelectBrand> = async (req, res) => {
    const brand = await this.brandsService.deleteOne(req.params.brandId);
    return res.success({ data: brand, i18n: { key: "brands.delete" } });
  };

  private updateOne: RequestHandler<SelectBrand, UpdateBrand> = async (
    req,
    res
  ) => {
    const brand = await this.brandsService.updateOne(
      req.params.brandId,
      req.body
    );
    res.success({ data: brand, i18n: { key: "brands.update" } });
  };

  private getAllItems: RequestHandler<SelectBrand> = async (req, res) => {
    const brand = await this.brandsService.getOne(req.params.brandId);
    return res.success({ data: brand.items });
  };
}
