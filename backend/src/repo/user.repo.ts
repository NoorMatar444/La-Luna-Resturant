import { Injectable } from '@nestjs/common';
import { DbRepo } from './DbRepo.js';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../models/user.model.js';
import { Model } from 'mongoose';

@Injectable()
export class UserRepo extends DbRepo<User> {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    super(userModel);
  }
}
