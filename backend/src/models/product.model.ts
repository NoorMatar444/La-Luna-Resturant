import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// Menu dishes. Checkout reads priceInCents from here and ignores any price the browser sends.
// Stripe charges EGP in piasters, so 90 EGP is stored as 9000.
@Schema({ collection: 'products', timestamps: true })
export class Product {
  @Prop({ type: String, required: true, unique: true })
  slug!: string;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String, required: true })
  section!: string;

  @Prop({ type: Number, required: true, min: 1 })
  priceInCents!: number;

  @Prop({ type: String, required: true, default: 'egp' })
  currency!: string;

  @Prop({ type: Number, required: true })
  position!: number;
}

export type HydratedProduct = HydratedDocument<Product>;
export const productSchema = SchemaFactory.createForClass(Product);

const ProductModel = MongooseModule.forFeature([
  {
    name: Product.name,
    schema: productSchema,
  },
]);
export default ProductModel;
