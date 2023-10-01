import Controller from "@api/v1/utils/interfaces/controller.interface";
import { Request, Response, Router } from "express";
import { ProfileService } from "../profile/profile.service";

export class WebhooksControoler implements Controller {
  public path: string;
  public router: Router;
  public profileService: ProfileService;

  constructor(path: string, profileService: ProfileService) {
    this.path = path;
    this.profileService = profileService;
    this.router = Router();

    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.post("/payment", this.payment);
  };

  public payment = async (req: Request, res: Response) => {
    const event = req.body;

    if (event.type === "payment_intent.succeeded") {
      const paymentIntentId = event.data.object.id;
      await this.profileService.updateOrderStatus(
        { user: "admin", paymentIntentId: paymentIntentId },
        "paid"
      );
    }

    return res.json({ received: true });
  };
}
