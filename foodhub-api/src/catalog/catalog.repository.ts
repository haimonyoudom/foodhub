import { Injectable } from '@nestjs/common';
import type { Restaurant } from './entities/restaurant.entity.js';

export type { Restaurant };

@Injectable()
export class CatalogRepository {
  private readonly restaurants: Restaurant[] = [
    { id: 1, name: 'Num Banh Chok Corner', area: 'Daun Penh' },
    { id: 2, name: 'Lok Lak House', area: 'BKK1' },
    { id: 3, name: 'Amok Garden', area: 'Toul Kork' },
  ];

  findAll(limit: number, offset: number): { data: Restaurant[]; total: number } {
    return {
      data: this.restaurants.slice(offset, offset + limit),
      total: this.restaurants.length,
    };
  }

  findById(id: number): Restaurant | undefined {
    return this.restaurants.find((r) => r.id === id);
  }

  exists(id: number): boolean {
    return this.restaurants.some((r) => r.id === id);
  }
}
