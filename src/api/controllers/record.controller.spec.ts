import { Test, TestingModule } from '@nestjs/testing';
import { RecordController } from './record.controller';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Record } from '../schemas/record.schema';
import { CreateRecordRequestDTO } from '../dtos/create-record.request.dto';
import { RecordCategory, RecordFormat } from '../schemas/record.enum';
import { RecordService } from '../services/record.service';
import { MusicBrainzService } from '../services/musicBrainz.service';

describe('RecordController', () => {
  let recordController: RecordController;
  let recordService: RecordService;
  let musicBrainzService: MusicBrainzService;
  let recordModel: Model<Record>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordController],
      providers: [
        RecordService,
        MusicBrainzService,
        {
          provide: getModelToken('Record'),
          useValue: {
            new: jest.fn().mockResolvedValue({}),
            constructor: jest.fn().mockResolvedValue({}),
            find: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    recordController = module.get<RecordController>(RecordController);
    recordService = module.get<RecordService>(RecordService);
    musicBrainzService = module.get<MusicBrainzService>(MusicBrainzService);
    recordModel = module.get<Model<Record>>(getModelToken('Record'));
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

    //jest.spyOn(recordModel, 'create').mockResolvedValue(savedRecord as any);
    jest.spyOn(recordService, 'create').mockResolvedValue(savedRecord as any);

    const result = await recordController.create(createRecordDto);
    expect(result).toEqual(savedRecord);
    expect(recordModel.create).toHaveBeenCalledWith({
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

    // jest.spyOn(recordModel, 'find').mockReturnValue({
    //   exec: jest.fn().mockResolvedValue(records),
    // } as any);

    jest.spyOn(recordService, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValue(records),
    } as any);

    const response = await recordController.findAll();
    expect(response).toEqual(records);
    expect(response.results.length).toEqual(response.totalResults);
    expect(recordModel.find).toHaveBeenCalled();
  });
});
