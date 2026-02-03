import { Test, TestingModule } from '@nestjs/testing';
import { RecordController } from './record.controller';
import { CreateRecordRequestDTO } from '../dtos/create-record.request.dto';
import { RecordCategory, RecordFormat } from '../schemas/record.enum';
import { RecordService } from '../services/record.service';
import { UpdateRecordRequestDTO } from '../dtos/update-record.request.dto';

describe('RecordController', () => {
  let recordController: RecordController;
  let recordService: RecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordController],
      providers: [
        {
          provide: RecordService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    recordController = module.get<RecordController>(RecordController);
    recordService = module.get<RecordService>(RecordService);
  });

  it('should be defined', () => {
    expect(recordController).toBeDefined();
  });

  it('should create a new record', async () => {
    const createRecordDto: CreateRecordRequestDTO = {
      artist: 'Test',
      album: 'Test Record',
      price: 100,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ALTERNATIVE,
    };

    const savedRecord = {
      _id: '1',
      name: 'Test Record',
      price: 100,
      qty: 10,
    };

    jest.spyOn(recordService, 'create').mockResolvedValue(savedRecord as any);

    const result = await recordController.create(createRecordDto);
    expect(result).toEqual(savedRecord);
    expect(recordService.create).toHaveBeenCalledWith({
      artist: 'Test',
      album: 'Test Record',
      price: 100,
      qty: 10,
      category: RecordCategory.ALTERNATIVE,
      format: RecordFormat.VINYL,
    });
  });

  it('should return an array of records', async () => {
    const records = {
      totalResults: 2,
      limitPage: 4,
      hasMorePages: false,
      results: [
        { _id: '1', name: 'Record 1', price: 100, qty: 10 },
        { _id: '2', name: 'Record 2', price: 200, qty: 20 },
      ],
    };

    jest.spyOn(recordService, 'find').mockResolvedValue(records as any);

    const response = await recordController.findAll();
    expect(response).toEqual(records);
    expect(response.results.length).toEqual(response.totalResults);
    expect(recordService.find).toHaveBeenCalled();
  });

  it('should return an updated record', async () => {
    const updateRecordDTO: UpdateRecordRequestDTO = {
      artist: 'Test',
      album: 'Test Record',
      price: 100,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ALTERNATIVE,
    };

    const savedRecord = {
      _id: '1',
      name: 'Test Record',
      price: 100,
      qty: 10,
    };

    jest.spyOn(recordService, 'update').mockResolvedValue(savedRecord as any);

    const response = await recordController.update('1', updateRecordDTO);
    expect(response).toEqual(savedRecord);
    expect(recordService.update).toHaveBeenCalled();
  });
});
