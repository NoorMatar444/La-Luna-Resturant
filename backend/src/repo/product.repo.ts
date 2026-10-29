import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../models/product.model';
import { DbRepo } from './DbRepo';

@Injectable()
export class ProductRepo extends DbRepo<Product> {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
  ) {
    super(productModel);
  }
}
