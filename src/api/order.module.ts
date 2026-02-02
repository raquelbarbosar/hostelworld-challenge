import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecordSchema } from './schemas/record.schema';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';
import { OrderSchema } from './schemas/order.schema';
import { RecordModule } from './record.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Order', schema: OrderSchema },
      { name: 'Record', schema: RecordSchema },
    ]),
    RecordModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
