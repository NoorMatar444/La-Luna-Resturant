import { Module } from '@nestjs/common';
import { StripeService } from '../../common/services/stripe.services';
import OrderItemModel from '../../models/order-item.model';
import OrderModel from '../../models/order.model';
import ProductModel from '../../models/product.model';
import { OrderItemRepo } from '../../repo/order-item.repo';
import { OrderRepo } from '../../repo/order.repo';
import { ProductRepo } from '../../repo/product.repo';
import { AuthModule } from '../auth/auth.module';
import { ReservationModule } from '../reservation/reservation.module';
import { OrderController, ProductController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    ProductModel,
    OrderModel,
    OrderItemModel,
    AuthModule,
    ReservationModule,
  ],
  controllers: [ProductController, OrderController],
  providers: [
    OrderService,
    ProductRepo,
    OrderRepo,
    OrderItemRepo,
    StripeService,
  ],
})
export class OrderModule {}
