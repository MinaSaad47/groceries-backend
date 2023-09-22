import Controller from "@api/v1/utils/interfaces/controller.interface";
import { Request, Response, Router } from "express";
import { UsersService } from "../users/users.service";
import { requireJwt, uploadProfilePicture } from "@api/v1/middlewares";
import { ProfileService } from "./profile.service";

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
    this.router.use([requireJwt]);
    this.router.route("/").get(this.getSigend).patch(this.update);

    this.router
      .route("/favorites")
      .post(this.addFavorite)
      .get(this.getAllFavorites);

    this.router.route("/favorites/:itemId").delete(this.deleteFavorite);

    this.router.route("/picture").post(uploadProfilePicture, this.addPicture);
  }

  private getSigend = async (req: Request, res: Response) => {
    const user = await this.profileSerivce.getOne(req.user!.id);
    return res.success({ data: user });
  };

  private update = async (req: Request, res: Response) => {
    const user = await this.profileSerivce.updateOne(req.user!.id, req.body);
    return res.success({ data: user, i18n: { key: "profile.update" } });
  };

  private addFavorite = async (req: Request, res: Response) => {
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

  private deleteFavorite = async (req: Request, res: Response) => {
    const favorite = await this.profileSerivce.deleteFavorite(
      req.user!.id,
      req.params.itemId
    );
    res.success({
      data: favorite,
      i18n: { key: "profile.favorite.delete" },
    });
  };

  private getAllFavorites = async (req: Request, res: Response) => {
    const favorites = await this.profileSerivce.getAllFavorites(req.user!.id);
    res.success({
      data: favorites,
    });
  };

  private addPicture = async (req: Request, res: Response) => {
    let user = req.user!;
    const path = req.file?.path;
    const updatedUser = await this.profileSerivce.updateOne(user.id, {
      profilePicture: path,
    });
    res.success({ data: updatedUser, i18n: { key: "profile.update.picture" } });
  };
}
