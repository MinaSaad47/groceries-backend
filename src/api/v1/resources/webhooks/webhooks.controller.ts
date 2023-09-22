import Controller from "@api/v1/utils/interfaces/controller.interface";
import log from "@api/v1/utils/logger";
import { Request, Response, Router } from "express";
import { CartsService } from "../carts/carts.service";

export class WebhooksControoler implements Controller {
  public path: string;
  public router: Router;
  public cartsService: CartsService;

  constructor(path: string, cartsSerivce: CartsService) {
    this.path = path;
    this.cartsService = cartsSerivce;
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
      await this.cartsService.updateOrder("admin", paymentIntentId, "paid");
    }

    return res.json({ received: true });
  };
}
