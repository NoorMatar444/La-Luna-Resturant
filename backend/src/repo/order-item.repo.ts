import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderItem } from '../models/order-item.model';
import { DbRepo } from './DbRepo';

@Injectable()
export class OrderItemRepo extends DbRepo<OrderItem> {
  constructor(
    @InjectModel(OrderItem.name)
    private readonly orderItemModel: Model<OrderItem>,
  ) {
    super(orderItemModel);
  }
}
