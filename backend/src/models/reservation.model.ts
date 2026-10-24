import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SeatingEnum, TimeEnum } from '../common/enums/reservation.enum.js';
import { User } from './user.model.js';

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user!: Types.ObjectId;

  @Prop({ type: String, required: true })
  visitDate!: string;

  @Prop({ type: Number, required: true, min: 1, max: 8 })
  guests!: number;

  @Prop({ type: String, enum: TimeEnum, required: true })
  time!: TimeEnum;

  @Prop({ type: String, enum: SeatingEnum, required: true })
  seating!: SeatingEnum;

  @Prop({ type: Boolean, default: false })
  birthday!: boolean;
}

export type HydratedReservation = HydratedDocument<Reservation>;
export const reservationSchema = SchemaFactory.createForClass(Reservation);

const ReservationModel = MongooseModule.forFeature([
  {
    name: Reservation.name,
    schema: reservationSchema,
  },
]);
export default ReservationModel;
