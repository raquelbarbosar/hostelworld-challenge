import { IsString, IsNotEmpty, Min, Max, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderRequestDTO {
  @ApiProperty({
    description: 'Record ID',
    type: String,
    example: '697f764259e66fcc3e348289',
  })
  @IsString()
  @IsNotEmpty()
  recordId: string;

  @ApiProperty({
    description: 'Quantity of the record in stock',
    type: Number,
    example: 1000,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  qty: number;
}
