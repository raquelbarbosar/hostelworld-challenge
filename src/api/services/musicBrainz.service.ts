import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../../app.config';
import { XMLParser } from 'fast-xml-parser';

@Injectable()
export class MusicBrainzService {
  private readonly logger = new Logger(MusicBrainzService.name);

  constructor(private readonly httpService: HttpService) {}

  async getRecordDetails(mbid: string): Promise<any> {
    const url = `/release/${mbid}?inc=recordings`;

    this.logger.log(`Getting record details from album ${mbid}`);

    // firstValueFrom -> Converts an observable to a promise
    const response = await firstValueFrom(
      this.httpService.get(url, {
        baseURL: AppConfig.musicBrainzUrl,
        headers: {
          Accept: 'application/xml',
          'User-Agent': AppConfig.userAgent,
        },
      }),
    );

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    const jsonRecordDetails = await parser.parse(response?.data);

    return jsonRecordDetails.metadata;
  }
}
