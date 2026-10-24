import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation } from '../models/reservation.model';
import { DbRepo } from './DbRepo';

@Injectable()
export class ReservationRepo extends DbRepo<Reservation> {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<Reservation>,
  ) {
    super(reservationModel);
  }
}
