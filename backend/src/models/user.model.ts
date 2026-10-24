import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { RoleEnum } from '../common/enums/user.enum.js';

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true, unique: true })
  userName!: string;

  @Prop({ type: String, required: true, unique: true, lowercase: true })
  email!: string;

  @Prop({ type: String, enum: RoleEnum, required: true })
  role!: RoleEnum;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: Boolean, default: false })
  confirmEmail!: boolean;

  @Prop({ type: Date })
  changeCreditTime?: Date;

  @Prop({ type: String, select: false, required: true })
  password!: string;
}

export type HydratedUser = HydratedDocument<User>;
export const userSchema = SchemaFactory.createForClass(User);

const UserModel = MongooseModule.forFeature([
  {
    name: User.name,
    schema: userSchema,
  },
]);
export default UserModel;
