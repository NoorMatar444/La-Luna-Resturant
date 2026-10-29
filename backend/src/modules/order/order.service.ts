import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Types } from 'mongoose';
import Stripe from 'stripe';
import { PaymentStatusEnum } from '../../common/enums/stripe.enum';
import { StripeService } from '../../common/services/stripe.services';
import { OrderItemRepo } from '../../repo/order-item.repo';
import { OrderRepo } from '../../repo/order.repo';
import { ProductRepo } from '../../repo/product.repo';
import { AuthService } from '../auth/auth.service';
import { ReservationService } from '../reservation/reservation.service';
import { CheckoutDto } from './order.dto';

// The evening menu. Prices are in piasters: 9000 is 90 EGP.
const MENU = [
  {
    slug: 'warm-olives',
    name: 'Warm olives, lemon, and chili',
    section: 'Starters',
    priceInCents: 9000,
  },
  {
    slug: 'bread-butter',
    name: 'Bread and cultured butter',
    section: 'Starters',
    priceInCents: 7000,
  },
  {
    slug: 'tomato-salad',
    name: 'Tomato salad with herbs',
    section: 'Starters',
    priceInCents: 12000,
  },
  {
    slug: 'grilled-catch',
    name: 'Grilled catch of the day',
    section: 'Mains',
    priceInCents: 34000,
  },
  {
    slug: 'roast-chicken',
    name: 'Slow roast chicken',
    section: 'Mains',
    priceInCents: 28000,
  },
  {
    slug: 'mushroom-pasta',
    name: 'Mushroom pasta',
    section: 'Mains',
    priceInCents: 24000,
  },
  {
    slug: 'chocolate-tart',
    name: 'Dark chocolate tart',
    section: 'Desserts',
    priceInCents: 14000,
  },
  {
    slug: 'olive-oil-cake',
    name: 'Orange olive oil cake',
    section: 'Desserts',
    priceInCents: 13000,
  },
];

@Injectable()
export class OrderService implements OnModuleInit {
  constructor(
    private readonly authService: AuthService,
    private readonly productRepo: ProductRepo,
    private readonly orderRepo: OrderRepo,
    private readonly orderItemRepo: OrderItemRepo,
    private readonly stripeService: StripeService,
    private readonly reservationService: ReservationService,
  ) {}

  // $setOnInsert adds missing dishes and never overwrites a price changed in the database.
  async onModuleInit() {
    await Promise.all(
      MENU.map((dish, position) =>
        this.productRepo.findOneAndUpdate({
          filter: { slug: dish.slug },
          update: { $setOnInsert: { ...dish, currency: 'egp', position } },
          options: { upsert: true },
        }),
      ),
    );
  }

  async listProducts() {
    const products = await this.productRepo.findAll({
      options: { sort: { position: 1 } },
    });
    return products.map((product) => ({
      id: product._id,
      name: product.name,
      section: product.section,
      priceInCents: product.priceInCents,
      currency: product.currency,
    }));
  }

  async checkout(authorization: string, body: CheckoutDto) {
    const profile = await this.authService.profile(authorization);
    const quantity = body.quantity ?? 1;
    const product = await this.productRepo.findById({ id: body.dishId });
    if (!product) {
      throw new NotFoundException('That dish is not on the menu.');
    }

    const unitAmount = product.priceInCents;
    const totalAmount = unitAmount * quantity;
    const order = await this.orderRepo.create({
      data: {
        user: profile.id,
        paymentStatus: PaymentStatusEnum.PENDING,
        currency: product.currency,
        totalAmount,
      },
    });
    await this.orderItemRepo.create({
      data: {
        order: order._id,
        product: product._id,
        name: product.name,
        unitAmount,
        quantity,
      },
    });

    const frontendUrl = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
      .split(',')[0]
      .trim();
    const session = await this.stripeService.generateCheckoutSession({
      mode: 'payment',
      customer_email: profile.email,
      client_reference_id: String(order._id),
      metadata: {
        orderId: String(order._id),
        userId: String(profile.id),
      },
      line_items: [
        {
          quantity,
          price_data: {
            currency: product.currency,
            unit_amount: unitAmount,
            product_data: { name: product.name },
          },
        },
      ],
      success_url: `${frontendUrl}/orders/success?order_id=${order._id}`,
      cancel_url: `${frontendUrl}/menu?cancelled=1`,
    });
    if (!session.url) {
      throw new BadRequestException('Stripe did not return a checkout url.');
    }

    order.stripeSessionId = session.id;
    await order.save();
    return { url: session.url, orderId: order._id };
  }

  async getForUser(authorization: string, id: string) {
    const profile = await this.authService.profile(authorization);
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Order not found.');
    }
    const order = await this.orderRepo.findById({ id });
    if (!order) {
      throw new NotFoundException('Order not found.');
    }
    if (String(order.user) !== String(profile.id)) {
      throw new ForbiddenException('You can only view your own order.');
    }
    const items = await this.orderItemRepo.findAll({
      filter: { order: order._id },
    });
    return {
      id: order._id,
      paymentStatus: order.paymentStatus,
      currency: order.currency,
      totalAmount: order.totalAmount,
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitAmount: item.unitAmount,
      })),
    };
  }

  // This is the only method that sets an order to paid.
  async handleWebhook(rawBody: Buffer | undefined, signature: string) {
    if (!rawBody || !signature) {
      throw new BadRequestException('Missing Stripe signature.');
    }

    let event: Stripe.Event;
    try {
      event = this.stripeService.createWebhookEvents(rawBody, signature);
    } catch {
      throw new BadRequestException('Invalid Stripe signature.');
    }

    if (
      event.type !== 'checkout.session.completed' &&
      event.type !== 'checkout.session.expired'
    ) {
      return { received: true };
    }

    const session = event.data.object as Stripe.Checkout.Session;
    // Stripe sends every checkout event here. Table deposits belong to reservations.
    if (session.metadata?.reservationId) {
      return this.reservationService.handleWebhook(rawBody, signature);
    }
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return { received: true };
    }

    if (event.type === 'checkout.session.expired') {
      await this.orderRepo.findOneAndUpdate({
        filter: {
          _id: orderId,
          stripeSessionId: session.id,
          paymentStatus: PaymentStatusEnum.PENDING,
        },
        update: { paymentStatus: PaymentStatusEnum.UNPAID },
      });
      return { received: true };
    }

    if (session.payment_status !== 'paid') {
      return { received: true };
    }

    await this.orderRepo.findOneAndUpdate({
      filter: {
        _id: orderId,
        stripeSessionId: session.id,
        paymentStatus: { $ne: PaymentStatusEnum.PAID },
      },
      update: { paymentStatus: PaymentStatusEnum.PAID },
    });
    return { received: true };
  }
}
