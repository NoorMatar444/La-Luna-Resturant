import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PaymentStatusEnum } from '../common/enums/stripe.enum.js';
import { User } from './user.model.js';

@Schema({ collection: 'orders', timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user!: Types.ObjectId;

  @Prop({
    type: String,
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.PENDING,
  })
  paymentStatus!: PaymentStatusEnum;

  @Prop({ type: String, required: true })
  currency!: string;

  @Prop({ type: Number, required: true, min: 1 })
  totalAmount!: number;

  @Prop({ type: String })
  stripeSessionId?: string;
}

export type HydratedOrder = HydratedDocument<Order>;
export const orderSchema = SchemaFactory.createForClass(Order);

const OrderModel = MongooseModule.forFeature([
  {
    name: Order.name,
    schema: orderSchema,
  },
]);
export default OrderModel;
