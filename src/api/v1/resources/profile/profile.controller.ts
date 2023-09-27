import { requireJwt, uploadProfilePicture } from "@api/v1/middlewares";
import { ImageUploadService } from "@api/v1/services/image_upload.service";
import Controller from "@api/v1/utils/interfaces/controller.interface";
import { bearerAuth, registry } from "@api/v1/utils/openapi/registery";
import { Router } from "express";
import { UpdateUser, UpdateUserSchema } from "../users/users.validation";
import { ProfileService } from "./profile.service";
import {
  CreateProfileFavorite,
  CreateProfileFavoriteSchema,
  SelectProfileFavorite,
  SelectProfileFavoriteSchema,
} from "./profile.validation";

export class ProfileController implements Controller {
  public path: string;
  public router: Router;
  private profileSerivce: ProfileService;

  constructor(path: string, userService: ProfileService) {
    this.path = path;
    this.router = Router();
    this.profileSerivce = userService;

    this.initializeRoutes();
  }

  private initializeRoutes() {
    registry.registerPath({
      tags: ["profile"],
      path: "/profile",
      method: "get",
      security: [{ [bearerAuth.name]: [] }],
      summary: "get signed user's profile",
      responses: {
        200: {
          description: "signed user's profile",
        },
      },
    });

    registry.registerPath({
      tags: ["profile"],
      path: "/profile",
      method: "patch",
      security: [{ [bearerAuth.name]: [] }],
      summary: "update signed user's profile",
      request: {
        body: {
          content: {
            "application/json": {
              schema: UpdateUserSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "updated signed user's profile",
        },
      },
    });

    registry.registerPath({
      tags: ["profile"],
      path: "/profile/favorites",
      method: "get",
      security: [{ [bearerAuth.name]: [] }],
      summary: "get all favorated items",
      responses: {
        200: {
          description: "array of items",
        },
      },
    });

    registry.registerPath({
      tags: ["profile"],
      path: "/profile/favorites",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "add favorated item",
      request: {
        body: {
          content: {
            "application/json": {
              schema: CreateProfileFavoriteSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "favorated item",
        },
      },
    });

    registry.registerPath({
      tags: ["profile"],
      path: "/profile/favorites/{itemId}",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "delete favorated item",
      request: {
        params: SelectProfileFavoriteSchema,
      },
      responses: {
        200: {
          description: "deleted favorated item",
        },
      },
    });

    registry.registerPath({
      tags: ["profile"],
      path: "/profile/picture",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "upload profile picture",
      request: {
        body: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["picture"],
                properties: {
                  picture: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "uploaded picture",
        },
      },
    });

    this.router.use([requireJwt]);
    this.router.route("/").get(this.getSigend).patch(this.update);

    this.router
      .route("/favorites")
      .post(this.addFavorite)
      .get(this.getAllFavorites);

    this.router.route("/favorites/:itemId").delete(this.deleteFavorite);

    this.router.route("/picture").post(uploadProfilePicture, this.addPicture);
  }

  private getSigend: RequestHandler = async (req, res) => {
    const user = await this.profileSerivce.getOne(req.user!.id);
    return res.success({ data: user });
  };

  private update: RequestHandler<{}, UpdateUser> = async (req, res) => {
    const user = await this.profileSerivce.updateOne(req.user!.id, req.body);
    return res.success({ data: user, i18n: { key: "profile.update" } });
  };

  private addFavorite: RequestHandler<{}, CreateProfileFavorite> = async (
    req,
    res
  ) => {
    const favorite = await this.profileSerivce.addFavorite(
      req.user!.id,
      req.body.itemId
    );

    res.success({
      code: 201,
      data: favorite,
      i18n: { key: "profile.favorite" },
    });
  };

  private deleteFavorite: RequestHandler<SelectProfileFavorite> = async (
    req,
    res
  ) => {
    const favorite = await this.profileSerivce.deleteFavorite(
      req.user!.id,
      req.params.itemId
    );
    res.success({
      data: favorite,
      i18n: { key: "profile.favorite.delete" },
    });
  };

  private getAllFavorites: RequestHandler = async (req, res) => {
    const favorites = await this.profileSerivce.getAllFavorites(req.user!.id);
    res.success({
      data: favorites,
    });
  };

  private addPicture: RequestHandler = async (req, res) => {
    let user = req.user!;
    const path = req.file?.path;

    const url = await ImageUploadService.uploadImage(
      `users/${user.id}`,
      path!,
      "picture"!
    );

    const updatedUser = await this.profileSerivce.updateOne(user.id, {
      profilePicture: url,
    });

    res.success({ data: updatedUser, i18n: { key: "profile.update.picture" } });
  };
}
