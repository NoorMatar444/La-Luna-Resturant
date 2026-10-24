import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HydratedUser, User } from '../../models/user.model.js';

@Injectable()
export class UserRepo {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  findById({ id }: { id: string }): Promise<HydratedUser | null> {
    return this.userModel.findById(id).exec();
  }
}
