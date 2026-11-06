// The PORT: what the ordering logic needs from storage, with no technology in it.
import type { Order } from './entities/order.entity.js';

export type { Order };

export interface OrderRepository {
  save(order: Order): Promise<void>;
  get(id: string): Promise<Order | undefined>;
}

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');
