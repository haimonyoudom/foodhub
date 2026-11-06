import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { OrdersService } from './orders.service.js';

@Controller('v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.get(id);
  }

  @Patch(':id')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.changeStatus(id, dto.status);
  }

  @Post()
  async create(
    @Body() dto: CreateOrderDto,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { order, isDuplicate } = await this.ordersService.place(
      dto.restaurantId,
      dto.items,
      key,
    );
    res.status(isDuplicate ? 200 : 201);
    return order;
  }
}
