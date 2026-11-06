import { Injectable } from '@nestjs/common';
import { CatalogRepository } from './catalog.repository.js';
import type { Restaurant } from './entities/restaurant.entity.js';

@Injectable()
export class CatalogService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  listRestaurants(limit: number, offset: number) {
    const { data, total } = this.catalogRepository.findAll(limit, offset);
    return { data, limit, offset, total };
  }

  restaurantExists(id: number): boolean {
    return this.catalogRepository.exists(id);
  }

  getRestaurant(id: number): Restaurant | undefined {
    return this.catalogRepository.findById(id);
  }
}
