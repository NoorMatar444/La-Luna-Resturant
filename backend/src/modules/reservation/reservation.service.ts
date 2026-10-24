import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { ReservationRepo } from '../../repo/reservation.repo';
import { CreateReservationDto } from './reservation.dto';

@Injectable()
export class ReservationService {
  constructor(
    private readonly authService: AuthService,
    private readonly reservationRepo: ReservationRepo,
  ) {}

  async create(authorization: string, body: CreateReservationDto) {
    const profile = await this.authService.profile(authorization);
    const visit = new Date(`${body.visitDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (visit < today) {
      throw new BadRequestException('Choose a date that is today or later.');
    }
    return this.reservationRepo.create({
      data: {
        user: profile.id,
        fullName: body.fullName.trim(),
        email: body.email.trim().toLowerCase(),
        visitDate: body.visitDate,
        guests: body.guests,
        time: body.time,
        seating: body.seating,
        birthday: body.birthday,
      },
    });
  }

  async listMine(authorization: string) {
    const profile = await this.authService.profile(authorization);
    return this.reservationRepo.findAll({
      filter: { user: profile.id },
      options: { sort: { createdAt: -1 } },
    });
  }
}
