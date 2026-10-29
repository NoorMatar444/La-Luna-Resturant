import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
@Injectable()
export class StripeService {
  private stripe: Stripe | null = null;
  private readonly webhook: string;
  constructor(private readonly ConfigService: ConfigService) {
    this.webhook = this.ConfigService.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
  }
  getClient() {
    if (!this.stripe) {
      const secret_key =
        this.ConfigService.getOrThrow<string>('STRIPE_SECRET_KEY');
      if (!secret_key) {
        throw new NotFoundException('secret key does not exist');
      }
      this.stripe = new Stripe(secret_key);
    }
    return this.stripe;
  }
  async generateCheckoutSession({
    customer_email,
    line_items,
    metadata,
    success_url,
    cancel_url,
    client_reference_id,
    mode = 'payment',
  }: Stripe.Checkout.SessionCreateParams) {
    return this.getClient().checkout.sessions.create({
      customer_email,
      line_items,
      metadata,
      success_url,
      cancel_url,
      client_reference_id,
      mode,
    });
  }
  createWebhookEvents(rawBody: Buffer, signature: string) {
    return this.getClient().webhooks.constructEvent(
      rawBody,
      signature,
      this.webhook,
    );
  }
}
