import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Record } from '../schemas/record.schema';
import { Model } from 'mongoose';
import { CreateRecordRequestDTO } from '../dtos/create-record.request.dto';
import { MusicBrainzService } from './musicBrainz.service';
import { Track } from '../schemas/track.schema';
import { UpdateRecordRequestDTO } from '../dtos/update-record.request.dto';

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
    if (request.mbid) {
      this.logger.log('Getting record track list');
      await this.getTrackList(request.mbid, newRecord);
    }

    this.logger.log('Creating record');

    //TODO: how i can improve this return?
    return await this.recordModel.create(newRecord);
  }

  async update(id: string, updateRecordDto: UpdateRecordRequestDTO): Promise<Record> {
    const record = await this.recordModel.findById(id);

    if (!record) {
      //TODO: need to change the error type here -> can lead to misunderstanding
      throw new InternalServerErrorException('Record not found');
    }

    if (updateRecordDto.mbid && (record.mbid !== updateRecordDto.mbid)) {
      this.logger.log('Getting record track list');
      await this.getTrackList(updateRecordDto.mbid, updateRecordDto);
    }

    Object.assign(record, updateRecordDto);

    const updated = await this.recordModel.updateOne(record);

    if (!updated) {
      //TODO: need to change the error type here -> can lead to misunderstanding
      throw new InternalServerErrorException('Failed to update record');
    }

    return record;
  }

  async getTrackList(albumMbid: string, newRecord: any): Promise<void> {
    const recordDetails = await this.musicBrainzService.getRecordDetails(
      albumMbid
    );

    if (recordDetails) {
      const trackList = await this.createTrackList(recordDetails);
      newRecord.trackList = trackList;
    }
  }

  async createTrackList(recordDetails: any): Promise<Track[]> {
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
}
