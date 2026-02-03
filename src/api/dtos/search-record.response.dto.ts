import { ApiProperty } from '@nestjs/swagger';
import { Record } from '../schemas/record.schema';

export class SearchRecordResponseDTO {
  @ApiProperty({
    description: '',
    type: Number,
    example: 10,
  })
  totalResults: number;

  @ApiProperty({
    description: '',
    type: Number,
    example: 10,
  })
  limitPage: number;

  @ApiProperty({
    description: '',
    type: Boolean,
    example: true,
  })
  hasMorePages: boolean;

  @ApiProperty({
    description: 'Records array (result)',
    type: Array,
    example: [],
  })
  results: Record[];
}
