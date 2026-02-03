import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RecordFormat, RecordCategory } from './record.enum';
import { Track, TrackSchema } from './track.schema';

@Schema({ timestamps: true })
export class Record extends Document {
  @Prop({ required: true })
  artist: string;

  @Prop({ required: true })
  album: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  qty: number;

  @Prop({ enum: RecordFormat, required: true })
  format: RecordFormat;

  @Prop({ enum: RecordCategory, required: true })
  category: RecordCategory;

  @Prop({ default: Date.now })
  created: Date;

  @Prop({ default: Date.now })
  lastModified: Date;

  @Prop({ required: false })
  mbid?: string;

  @Prop({
    required: false,
    type: [{ type: [TrackSchema] }],
  })
  trackList?: Track[];
}

export const RecordSchema = SchemaFactory.createForClass(Record);
