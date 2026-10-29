import { Type } from 'class-transformer';
import { IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';

// The browser may send which dish and how many. It may not send a price.
export class CheckoutDto {
  @IsMongoId({ message: 'Choose a dish from the menu.' })
  dishId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  quantity?: number;
}
