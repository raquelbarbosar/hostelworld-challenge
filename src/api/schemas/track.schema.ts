import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Track extends Document {
  @Prop({ required: true })
  mbid: string;

  @Prop({ required: true })
  number: string;

  @Prop({ required: true })
  position: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  length: number;
}

export const TrackSchema = SchemaFactory.createForClass(Track);
