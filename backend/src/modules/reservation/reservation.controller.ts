import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { CreateReservationDto } from './reservation.dto';
import { ReservationService } from './reservation.service';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  create(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: CreateReservationDto,
  ) {
    return this.reservationService.create(authorization ?? '', body);
  }

  @Get()
  listMine(@Headers('authorization') authorization: string | undefined) {
    return this.reservationService.listMine(authorization ?? '');
  }
}
