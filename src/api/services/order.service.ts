import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Record } from '../schemas/record.schema';
import { Connection, Model } from 'mongoose';
import { CreateOrderRequestDTO } from '../dtos/create-order.request.dto';
import { RecordService } from './record.service';
import { Order } from '../schemas/order.schema';
import { UpdateRecordRequestDTO } from '../dtos/update-record.request.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Record.name) private recordModel: Model<Record>,
    @InjectConnection() private readonly connection: Connection,
    private readonly recordService: RecordService,
  ) {}

  async create(createOrderRequestDto: CreateOrderRequestDTO): Promise<any> {
    const dbSession = await this.connection.startSession();
    await dbSession.startTransaction();

    //TODO: return only the fields that i need to save bandwith (time)
    const record = await this.recordModel.findById(
      createOrderRequestDto.recordId,
    );

    if (!record) {
      await dbSession.abortTransaction();
      throw new NotFoundException('Record not found');
    }

    if (record.qty === 0) {
      await dbSession.abortTransaction();
      throw new BadRequestException(
        `Operation aborted! Out of stock for product ${record.artist} - ${record.album}`,
      );
    }

    if (record.qty < createOrderRequestDto.qty) {
      await dbSession.abortTransaction();
      throw new BadRequestException(
        `Operation aborted! Insufficient stock, there are ${record.qty} units of this product.`,
      );
    }

    const newOrder = {
      idRecord: record._id,
      price: record.price,
      qty: createOrderRequestDto.qty,
      format: record.format,
      category: record.category,
    } as any;
    let order: Order = null;

    const newQty = record.qty - newOrder.qty;
    const recordUpdated = await this.recordService.update(newOrder.idRecord, {
      qty: newQty,
    } as UpdateRecordRequestDTO);

    if (!recordUpdated) {
      await dbSession.abortTransaction();
      throw new BadRequestException(
        'Operation aborted! It was not possible to update the product at this time.',
      );
    }

    order = await this.orderModel.create(newOrder);

    if (!order) {
      await dbSession.abortTransaction();
      throw new BadRequestException(
        'Operation aborted! It was not possible to create the order at this time.',
      );
    }

    return order;
  }
}
