import { Test, TestingModule } from '@nestjs/testing';
import { RecordService } from './record.service';
import { getModelToken } from '@nestjs/mongoose';
import { MusicBrainzService } from './musicBrainz.service';
import { Model } from 'mongoose';
import { Record } from '../schemas/record.schema';
import { RecordCategory, RecordFormat } from '../schemas/record.enum';
import { CreateRecordRequestDTO } from '../dtos/create-record.request.dto';
import { UpdateRecordRequestDTO } from '../dtos/update-record.request.dto';
import { SearchRecordResponseDTO } from '../dtos/search-record.response.dto';

describe('RecordService', () => {
  let recordService: RecordService;
  let recordModel: Model<Record>;
  let musicBrainzService: MusicBrainzService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordService,
        {
          provide: getModelToken('Record'),
          useValue: {
            new: jest.fn().mockResolvedValue({}),
            constructor: jest.fn().mockResolvedValue({}),
            create: jest.fn(),
            findById: jest.fn(),
            updateOne: jest.fn(),
            find: jest.fn(),
            sort: jest.fn(),
            limit: jest.fn(),
            lean: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: MusicBrainzService,
          useValue: {
            getRecordDetails: jest.fn(),
          },
        },
      ],
    }).compile();

    recordService = module.get<RecordService>(RecordService);
    recordModel = module.get<Model<Record>>(getModelToken('Record'));
    musicBrainzService = module.get<MusicBrainzService>(MusicBrainzService);
  });

  it('should be defined', () => {
    expect(recordService).toBeDefined();
  });

  it('create()', async () => {
    const trackList = [
      [
        {
          mbid: 'af19bbfd-fb14-3d15-a6aa-8072cf06775a',
          number: 'A1',
          position: '1',
          title: 'Come Together',
          length: 261000,
          _id: '697f56464ff582198e29a8a5',
        },
      ],
      [
        {
          mbid: '1745aa16-a379-3623-93f1-43702101ce29',
          number: 'A2',
          position: '2',
          title: 'Something',
          length: 183000,
          _id: '697f56464ff582198e29a8a6',
        },
      ],
    ] as any;

    const createRecordDto: CreateRecordRequestDTO = {
      artist: 'Test',
      album: 'Test Record',
      price: 100,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ALTERNATIVE,
      mbid: 'd6010be3-98f8-422c-a6c9-787e2e491e58',
    };

    const savedRecord = {
      _id: '1',
      artist: 'Test Record',
      album: 'Test Record',
      price: 100,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ALTERNATIVE,
      trackList,
    } as Record;

    jest
      .spyOn(musicBrainzService, 'getRecordDetails')
      .mockResolvedValue(undefined);

    jest.spyOn(recordModel, 'create').mockResolvedValue(savedRecord as any);

    const response = await recordService.create(createRecordDto);

    expect(response).toEqual(savedRecord);
    expect(musicBrainzService.getRecordDetails).toHaveBeenCalled();
  });

  it('getTrackList()', async () => {
    const trackList = [
      {
        mbid: '7d8ff56b-34f6-4191-bd41-27d288e70930',
        number: 'A1',
        position: '1',
        title: 'Taste',
        length: 157000,
      },
      {
        mbid: '937d3476-9992-4d62-86d7-671143f46893',
        number: 'A2',
        position: '2',
        title: 'Please Please Please',
        length: 186000,
      },
    ] as any;

    const recordDetails = {
      release: {
        title: "Short n' Sweet",
        'medium-list': {
          medium: {
            position: 1,
            format: {
              '#text': '12" Vinyl',
              '@_id': '3e9080b0-5e6c-34ab-bd15-f526b6306a64',
            },
            'track-list': {
              track: [
                {
                  position: '1',
                  number: 'A1',
                  length: 157000,
                  recording: {
                    title: 'Taste',
                  },
                  '@_id': '7d8ff56b-34f6-4191-bd41-27d288e70930',
                },
                {
                  position: '2',
                  number: 'A2',
                  length: 186000,
                  recording: {
                    title: 'Please Please Please',
                  },
                  '@_id': '937d3476-9992-4d62-86d7-671143f46893',
                },
              ],
            },
          },
        },
      },
    };

    const newRecord = {
      artist: 'Sabrina Carpenter',
      album: "Short n' Sweet",
      price: 40.6,
      qty: 100,
      format: RecordFormat.VINYL,
      category: RecordCategory.POP,
      mbid: 'fadeb972-22ea-4846-ab23-9ee37ae5c175',
    } as Record;

    jest
      .spyOn(musicBrainzService, 'getRecordDetails')
      .mockResolvedValue(recordDetails);

    await expect(recordService.getTrackList(newRecord)).resolves.not.toThrow();
    expect(newRecord.trackList).toEqual(trackList);
  });

  describe('update()', () => {
    test('update() - Ok', async () => {
      const recordDetails = {
        release: {
          'medium-list': {
            medium: {
              position: 1,
              format: {
                '#text': '12" Vinyl',
                '@_id': '3e9080b0-5e6c-34ab-bd15-f526b6306a64',
              },
              'track-list': {
                track: [
                  {
                    position: '1',
                    number: 'A1',
                    length: 261000,
                    recording: {
                      title: 'Come Together',
                    },
                    '@_id': 'af19bbfd-fb14-3d15-a6aa-8072cf06775a',
                  },
                  {
                    position: '2',
                    number: 'A2',
                    length: 183000,
                    recording: {
                      title: 'Something',
                    },
                    '@_id': '1745aa16-a379-3623-93f1-43702101ce29',
                  },
                ],
              },
            },
          },
        },
      };

      const trackList = [
        {
          mbid: 'af19bbfd-fb14-3d15-a6aa-8072cf06775a',
          number: 'A1',
          position: '1',
          title: 'Come Together',
          length: 261000,
        },
        {
          mbid: '1745aa16-a379-3623-93f1-43702101ce29',
          number: 'A2',
          position: '2',
          title: 'Something',
          length: 183000,
        },
      ] as any;

      const updateRecordDto: UpdateRecordRequestDTO = {
        artist: 'Test Record',
        album: 'Test Record',
        price: 100,
        qty: 10,
        format: RecordFormat.VINYL,
        category: RecordCategory.ALTERNATIVE,
        mbid: 'd6010be3-98f8-422c-a6c9-787e2e491e58',
      };

      const foundRecord = {
        _id: '1',
        artist: 'Test Record',
        album: 'Test Record',
        price: 100,
        qty: 10,
        format: RecordFormat.VINYL,
        category: RecordCategory.ALTERNATIVE,
      } as Record;

      const updatedRecord = {
        _id: '1',
        artist: 'Test Record',
        album: 'Test Record',
        price: 100,
        qty: 10,
        format: RecordFormat.VINYL,
        category: RecordCategory.ALTERNATIVE,
        mbid: 'd6010be3-98f8-422c-a6c9-787e2e491e58',
        trackList,
      } as Record;

      jest.spyOn(recordModel, 'findById').mockResolvedValue(foundRecord as any);

      jest
        .spyOn(musicBrainzService, 'getRecordDetails')
        .mockResolvedValue(recordDetails);

      jest
        .spyOn(recordModel, 'updateOne')
        .mockResolvedValue(updatedRecord as any);

      const response = await recordService.update('1', updateRecordDto);

      expect(response).toEqual(updatedRecord);
      expect(musicBrainzService.getRecordDetails).toHaveBeenCalled();
    });

    test('update() - 404 - Record Not Found', async () => {
      const updateRecordDto: UpdateRecordRequestDTO = {
        artist: 'Test Record',
        album: 'Test Record',
        price: 100,
        qty: 10,
        format: RecordFormat.VINYL,
        category: RecordCategory.ALTERNATIVE,
        mbid: 'd6010be3-98f8-422c-a6c9-787e2e491e58',
      };

      jest.spyOn(recordModel, 'findById').mockResolvedValue(undefined);

      try {
        await recordService.update('1', updateRecordDto);
      } catch (err) {
        expect(err).toHaveProperty('status', 404);
        expect(err).toHaveProperty('message', 'Record not found');
      }
    });

    test('update() - 400 - Failed to update', async () => {
      const foundRecord = {
        _id: '1',
        artist: 'Test Record',
        album: 'Test Record',
        price: 100,
        qty: 10,
        format: RecordFormat.VINYL,
        category: RecordCategory.ALTERNATIVE,
      } as Record;

      const updateRecordDto: UpdateRecordRequestDTO = {
        artist: 'Test Record',
        album: 'Test Record',
        price: 100,
        qty: 10,
        format: RecordFormat.VINYL,
        category: RecordCategory.ALTERNATIVE,
        mbid: 'd6010be3-98f8-422c-a6c9-787e2e491e58',
      };

      jest.spyOn(recordModel, 'findById').mockResolvedValue(foundRecord as any);

      jest
        .spyOn(musicBrainzService, 'getRecordDetails')
        .mockResolvedValue(undefined);

      jest.spyOn(recordModel, 'updateOne').mockResolvedValue(undefined);

      try {
        await recordService.update('1', updateRecordDto);
      } catch (err) {
        expect(err).toHaveProperty('status', 400);
        expect(err).toHaveProperty('message', 'Failed to update record');
      }
    });
  });

//   it('find() - Ok - all filters', async () => {
//     const foundRecords = [
//       {
//         _id: '5',
//         artist: 'The Cure',
//         album: 'Wish',
//         price: 5.99,
//         qty: 23,
//         format: 'CD',
//         category: 'Rock',
//         mbid: '41cad68c-69f3-3f00-9f14-3bad16dfc213',
//         created: '2026-01-29T18:30:21.742Z',
//         lastModified: '2026-01-29T18:30:21.742Z',
//         createdAt: '2026-01-29T18:30:21.745Z',
//         updatedAt: '2026-02-02T10:07:52.202Z',
//       },
//       {
//         _id: '6',
//         artist: 'The Cure',
//         album: 'Disintegration',
//         price: 23,
//         qty: 1,
//         format: 'Vinyl',
//         category: 'Alternative',
//         mbid: '11af85e2-c272-4c59-a902-47f75141dc97',
//         created: '2026-01-29T18:30:21.743Z',
//         lastModified: '2026-01-29T18:30:21.743Z',
//         createdAt: '2026-01-29T18:30:21.746Z',
//         updatedAt: '2026-01-29T18:30:21.746Z',
//       },
//     ] as unknown as Record[];

//     const searchRecordDto: SearchRecordResponseDTO = {
//       totalResults: 2,
//       limitPage: 4,
//       hasMorePages: false,
//       results: foundRecords,
//     };

//     jest.spyOn(recordModel, 'find').mockResolvedValue(foundRecords as any);
//     jest.spyOn(recordModel, 'sort').mockResolvedValue({} as any);

//     const response = await recordService.find(
//       4,
//       '4',
//       'cure',
//       null,
//       null,
//       null,
//       null,
//     );

//     expect(response).toEqual(searchRecordDto);
//   });
});
