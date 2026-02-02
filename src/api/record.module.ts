import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecordController } from './controllers/record.controller';
import { RecordService } from './services/record.service';
import { RecordSchema } from './schemas/record.schema';
import { MusicBrainzService } from './services/musicBrainz.service';
import { HttpModule } from '@nestjs/axios';
import { TrackSchema } from './schemas/track.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Record', schema: RecordSchema },
      { name: 'Track', schema: TrackSchema },
    ]),
    HttpModule,
  ],
  controllers: [RecordController],
  providers: [RecordService, MusicBrainzService],
  exports: [RecordService]
})
export class RecordModule {}
