import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Record } from '../schemas/record.schema';
import { Model } from 'mongoose';
import { CreateRecordRequestDTO } from '../dtos/create-record.request.dto';
import { MusicBrainzService } from './musicBrainz.service';
import { Track } from '../schemas/track.schema';

@Injectable()
export class RecordService {
  private readonly logger = new Logger(RecordService.name);

  constructor(
    @InjectModel(Record.name) private recordModel: Model<Record>,
    private readonly musicBrainzService: MusicBrainzService,
  ) {}

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
      const recordDetails = await this.musicBrainzService.getRecordDetails(
        request.mbid,
      );

      if (recordDetails) {
        const trackList = await this.getTrackList(recordDetails);
        newRecord.trackList = trackList;
      }
    }

    this.logger.log('Creating record');

    //TODO: how i can improve this return?
    return await this.recordModel.create(newRecord);
  }

  async getTrackList(recordDetails: any): Promise<Track[]> {
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
