import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../models/order.model';
import { DbRepo } from './DbRepo';

@Injectable()
export class OrderRepo extends DbRepo<Order> {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
  ) {
    super(orderModel);
  }
}
