import Stripe from "stripe";

export abstract class PaymentService {
  private static stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2023-08-16",
    typescript: true,
  });

  private static createWebhock = async () => {
    const endpoint = await this.stripe.webhookEndpoints.create({
      url: "https://example.com/my/webhook/endpoint",
      enabled_events: [
        "payment_intent.payment_failed",
        "payment_intent.succeeded",
      ],
    });
  };

  public static createPayment = async (amount: number, email: string) => {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "egp",
      payment_method_types: ["card"],
      payment_method: "pm_card_visa",
      receipt_email: email,
    });

    console.log(paymentIntent);

    return {
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      paymentIntentId: paymentIntent.id,
    };
  };

  public static findPayment = async (paymentIntentId: string) => {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      paymentIntentId
    );

    return {
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      paymentIntentId: paymentIntent.id,
    };
  };
}
