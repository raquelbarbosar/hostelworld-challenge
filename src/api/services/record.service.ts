import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Record } from '../schemas/record.schema';
import { Model } from 'mongoose';
import { CreateRecordRequestDTO } from '../dtos/create-record.request.dto';
import { MusicBrainzService } from './musicBrainz.service';
import { Track } from '../schemas/track.schema';
import { UpdateRecordRequestDTO } from '../dtos/update-record.request.dto';
import { SearchRecordResponseDTO } from '../dtos/search-record.response.dto';
import { RecordFormat, RecordCategory } from '../schemas/record.enum';

@Injectable()
export class RecordService {
  private readonly logger = new Logger(RecordService.name);

  constructor(
    @InjectModel(Record.name) private recordModel: Model<Record>,
    private readonly musicBrainzService: MusicBrainzService,
  ) { }

  async create(request: CreateRecordRequestDTO): Promise<Record> {
    const newRecord = {
      artist: request.artist,
      album: request.album,
      price: request.price,
      qty: request.qty,
      format: request.format,
      category: request.category,
      mbid: request.mbid,
    } as any;

    //TODO: check MBID -> create a function for that, to see if is valid
    if (newRecord.mbid) {
      this.logger.log('Getting record track list');
      await this.getTrackList(newRecord);
    }

    this.logger.log('Creating record');

    return await this.recordModel.create(newRecord);
  }

  async update(id: string, updateRecordDto: UpdateRecordRequestDTO): Promise<Record> {
    const record = await this.recordModel.findById(id);

    if (!record) {
      throw new NotFoundException('Record not found');
    }

    if (updateRecordDto.mbid && (record.mbid !== updateRecordDto.mbid)) {
      this.logger.log('Getting record track list');
      await this.getTrackList(updateRecordDto);
    }

    Object.assign(record, updateRecordDto);

    const updated = await this.recordModel.updateOne(record);

    if (!updated) {
      throw new BadRequestException('Failed to update record');
    }

    return record;
  }

  async getTrackList(newRecord: any): Promise<void> {
    const recordDetails = await this.musicBrainzService.getRecordDetails(
      newRecord.mbid
    );

    if (recordDetails) {
      const trackList = await this.createTrackList(recordDetails);
      newRecord.trackList = trackList;
    }
  }

  private async createTrackList(recordDetails: any): Promise<Track[]> {
    const trackList = [];
    const trackDetailsList =
      recordDetails?.release['medium-list']?.medium['track-list']?.track ??
      null;

    if (trackDetailsList) {
      trackDetailsList.forEach((track) => {
        trackList.push({
          mbid: track['@_id'],
          number: track.number,
          position: track.position,
          title: track.recording.title,
          length: track.length,
        } as any);
      });
    }

    return trackList;
  }

  async find(limitPage: number, lastId: string, q: string, artist: string, album: string, format: RecordFormat, category: RecordCategory): Promise<SearchRecordResponseDTO> {
    //const count = await this.recordModel.countDocuments({}).exec(); //takes too long for big inputs
    //I also can use the metadataSet in the search
    //const count = Math.max();
    //const skip = (page - 1) * limitPage;
    //const totalPage = Math.floor((count - 1)/ limitPage) + 1;

    const filters = this.getFiltersObject(lastId, artist, album, format, category, q);

    const recordsResult = await this.recordModel.find(filters).sort('_id').limit(limitPage).lean().exec();

    const hasMorePages = recordsResult.length === limitPage;
  
    return { totalResults: recordsResult.length, limitPage, hasMorePages, results: recordsResult } as SearchRecordResponseDTO;
  }

  private getFiltersObject(lastId: string, artist: string, album: string, format: RecordFormat, category: RecordCategory, q: string): object {
    let filters = {};

    if (lastId) {
      filters = { _id: { $gt: lastId } }
    } 

    if (artist) filters = { ...filters, artist };
    if (album) filters = { ...filters, album };
    if (format) filters = { ...filters, format };
    if (category) filters = { ...filters, category };

    if (q) {
      const text = q.trim();
      const regexQuery = new RegExp(this.escapeRegex(text), 'i');
      filters = { ...filters, $or: [{ album: { $regex: regexQuery } }, { artist: { $regex: regexQuery } }] };
    }

    return filters;
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
