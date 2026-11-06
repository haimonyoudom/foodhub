import { ArrayNotEmpty, IsInt, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  restaurantId: number;

  @ArrayNotEmpty()
  @IsString({ each: true })
  items: string[];
}

