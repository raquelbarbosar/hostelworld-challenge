/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from '../services/order.service';
import { CreateOrderRequestDTO } from '../dtos/create-order.request.dto';
import { RecordCategory, RecordFormat } from '../schemas/record.enum';

describe('OrderController', () => {
  let orderController: OrderController;
  let orderService: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    orderController = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(orderController).toBeDefined();
  });

  it('should create a new order', async () => {
    const createOrderDto: CreateOrderRequestDTO = {
      recordId: '1',
      qty: 10,
    };

    const savedOrder = {
      _id: '1',
      price: 100,
      qty: 10,
      category: RecordCategory.ALTERNATIVE,
      format: RecordFormat.VINYL,
    };

    jest.spyOn(orderService, 'create').mockResolvedValue(savedOrder as any);

    const result = await orderController.create(createOrderDto);
    expect(result).toEqual(savedOrder);
    expect(orderService.create).toHaveBeenCalledWith({
      recordId: '1',
      qty: 10,
    });
  });
});
