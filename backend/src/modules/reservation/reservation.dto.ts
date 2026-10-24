import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { SeatingEnum, TimeEnum } from '../../common/enums/reservation.enum';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty({ message: 'Enter your full name.' })
  fullName!: string;

  @IsEmail({}, { message: 'Enter a valid email so we can confirm.' })
  email!: string;

  @IsDateString({}, { message: 'Choose a date.' })
  visitDate!: string;

  @Type(() => Number)
  @IsInt({ message: 'At least 1 guest.' })
  @Min(1, { message: 'At least 1 guest.' })
  @Max(8, { message: 'Parties larger than 8 should email us first.' })
  guests!: number;

  @IsEnum(TimeEnum, { message: 'Choose a time.' })
  time!: TimeEnum;

  @IsEnum(SeatingEnum, { message: 'Choose a seating option.' })
  seating!: SeatingEnum;

  @IsBoolean()
  birthday!: boolean;
}
