import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'orderItems', timestamps: true })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product!: Types.ObjectId;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: Number, required: true, min: 1 })
  unitAmount!: number;

  @Prop({ type: Number, required: true, min: 1 })
  quantity!: number;
}

export type HydratedOrderItem = HydratedDocument<OrderItem>;
export const orderItemSchema = SchemaFactory.createForClass(OrderItem);

const OrderItemModel = MongooseModule.forFeature([
  {
    name: OrderItem.name,
    schema: orderItemSchema,
  },
]);
export default OrderItemModel;
