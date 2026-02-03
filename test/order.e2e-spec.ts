import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { RecordFormat, RecordCategory } from '../src/api/schemas/record.enum';

describe('OrderController (e2e)', () => {
  let app: INestApplication;
  let recordId: string;
  let orderId: string;
  let orderModel;
  let recordModel;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    orderModel = app.get('OrderModel');
    recordModel = app.get('RecordModel');
    await app.init();
  });

  it('should create a new order', async () => {
    const createRecordDto = {
      artist: 'The Fake Band',
      album: 'Fake Album',
      price: 25,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ROCK,
    };

    const recordResponse = await request(app.getHttpServer())
      .post('/records')
      .send(createRecordDto)
      .expect(201);

    recordId = recordResponse.body._id;

    console.log(recordId);

    const createOrderdDto = {
      id: recordId,
      qty: 5,
    };

    const orderResponse = await request(app.getHttpServer())
      .post('/order')
      .send(createOrderdDto)
      .expect(201);

    orderId = orderResponse.body._id;
    expect(orderResponse.body).toHaveProperty('idRecord', recordId);
    expect(orderResponse.body).toHaveProperty('qty', createOrderdDto.qty);
  });

  afterEach(async () => {
    if (recordId) {
      await recordModel.findByIdAndDelete(recordId);
    }

    if (orderId) {
      await orderModel.findByIdAndDelete(orderId);
    }
  });

  afterAll(async () => {
    await app.close();
  });
});
