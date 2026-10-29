import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { ReservationRepo } from '../../repo/reservation.repo';
import { CreateReservationDto } from './reservation.dto';
import { TokenService } from '../../common/services/token.services';
import { TokenEnum } from '../../common/enums/token.enum';
import { PaymentStatusEnum } from '../../common/enums/stripe.enum';
import { StripeService } from '../../common/services/stripe.services';
import { Types } from 'mongoose';
import Stripe from 'stripe';

@Injectable()
export class ReservationService {
  constructor(
    private readonly authService: AuthService,
    private readonly reservationRepo: ReservationRepo,
    private readonly TokenService: TokenService,
    private readonly AuthService: AuthService,
    private readonly StripeService: StripeService,
  ) {}

  async create(authorization: string, body: CreateReservationDto) {
    const profile = await this.authService.profile(authorization);
    const visit = new Date(`${body.visitDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (visit < today) {
      throw new BadRequestException('Choose a date that is today or later.');
    }
    return this.reservationRepo.create({
      data: {
        user: profile.id,
        fullName: body.fullName.trim(),
        email: body.email.trim().toLowerCase(),
        visitDate: body.visitDate,
        guests: body.guests,
        time: body.time,
        seating: body.seating,
        birthday: body.birthday,
      },
    });
  }

  async listMine(authorization: string) {
    const profile = await this.authService.profile(authorization);
    return this.reservationRepo.findAll({
      filter: { user: profile.id },
      options: { sort: { createdAt: -1 } },
    });
  }

  async checkout(accessToken: string, id: string) {
    if (!accessToken) {
      throw new NotFoundException('token does not exist');
    }
    const authorization = accessToken.startsWith('Bearer ')
      ? accessToken
      : `Bearer ${accessToken}`;
    const { user, verifiedToken } = await this.TokenService.checkToken({
      authorization,
      tokenType: TokenEnum.ACCESS,
    });
    if (!user || !verifiedToken) {
      throw new BadRequestException('token is not valid');
    }
    const profile = await this.AuthService.profile(authorization);
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('reservation does not exist');
    }
    const reservation = await this.reservationRepo.findById({ id });
    if (!reservation) {
      throw new NotFoundException('reservation does not exist');
    }
    if (String(reservation.user) !== String(profile.id)) {
      throw new ForbiddenException(
        'A user can only pay for their own reservation.',
      );
    }
    if (reservation.paymentStatus === PaymentStatusEnum.PAID) {
      throw new BadRequestException('can not proceed if the payment is paid');
    }
    const frontendUrl = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
      .split(',')[0]
      .trim();
    if (
      reservation.paymentStatus === PaymentStatusEnum.PENDING &&
      reservation.stripeSessionId
    ) {
      try {
        const existing =
          await this.StripeService.getClient().checkout.sessions.retrieve(
            reservation.stripeSessionId,
          );
        if (existing.status === 'open' && existing.url) {
          return { url: existing.url };
        }
      } catch {
        // The stored session is gone. A fresh one is created below.
      }
    }
    const currency = 'egp';
    // Stripe rejects a session worth less than about 31 EGP on this account.
    const depositAmount = 5000;
    const session = await this.StripeService.generateCheckoutSession({
      mode: 'payment',
      customer_email: reservation.email,
      client_reference_id: String(reservation._id),
      metadata: {
        reservationId: String(reservation._id),
        userId: String(profile.id),
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: depositAmount,
            product_data: {
              name: `La Luna deposit · ${reservation.visitDate} ${reservation.time}`,
            },
          },
        },
      ],
      success_url: `${frontendUrl}/reservations?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/reservations?cancelled=1`,
    });
    if (!session.url) {
      throw new BadRequestException('Stripe did not return a checkout url.');
    }
    reservation.stripeSessionId = session.id;
    reservation.paymentStatus = PaymentStatusEnum.PENDING;
    reservation.currency = currency;
    reservation.depositAmount = depositAmount;
    await reservation.save();
    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer | undefined, signature: string) {
    if (!rawBody || !signature) {
      throw new BadRequestException('Missing Stripe signature.');
    }

    let event: Stripe.Event;
    try {
      event = this.StripeService.createWebhookEvents(rawBody, signature);
    } catch {
      throw new BadRequestException('Invalid Stripe signature.');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const reservationId = session.metadata?.reservationId;
      if (!reservationId) {
        return { received: true };
      }

      if (session.payment_status !== 'paid') {
        return { received: true };
      }

      await this.reservationRepo.findOneAndUpdate({
        filter: {
          _id: reservationId,
          stripeSessionId: session.id,
          paymentStatus: { $ne: PaymentStatusEnum.PAID },
        },
        update: {
          paymentStatus: PaymentStatusEnum.PAID,
        },
      });
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      await this.reservationRepo.findOneAndUpdate({
        filter: {
          stripeSessionId: session.id,
          paymentStatus: PaymentStatusEnum.PENDING,
        },
        update: {
          paymentStatus: PaymentStatusEnum.UNPAID,
        },
      });
    }

    return { received: true };
  }
}
