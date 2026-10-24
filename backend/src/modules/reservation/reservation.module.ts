import { Module } from '@nestjs/common';
import ReservationModel from '../../models/reservation.model';
import { ReservationRepo } from '../../repo/reservation.repo';
import { AuthModule } from '../auth/auth.module';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';

@Module({
  imports: [ReservationModel, AuthModule],
  controllers: [ReservationController],
  providers: [ReservationService, ReservationRepo],
})
export class ReservationModule {}
