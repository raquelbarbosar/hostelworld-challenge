import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import { CreateOrderRequestDTO } from '../dtos/create-order.request.dto';
import { Order } from '../schemas/order.schema';

@Controller('order')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(
    //TODO: refactor to buy more than one product
    @Body() createOrderRequestDto: CreateOrderRequestDTO,
  ): Promise<Order> {
    this.logger.log('Creating order');
    return await this.orderService.create(createOrderRequestDto);
  }
}
