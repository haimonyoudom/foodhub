import { IsIn } from 'class-validator';

export const ORDER_STATUSES = [
  'PLACED',
  'COOKING',
  'DELIVERING',
  'DELIVERED',
  'CANCELLED',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUSES)
  status: string;
}

