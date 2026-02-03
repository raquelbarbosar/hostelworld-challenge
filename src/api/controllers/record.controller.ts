import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Logger,
} from '@nestjs/common';
import { Record } from '../schemas/record.schema';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CreateRecordRequestDTO } from '../dtos/create-record.request.dto';
import { RecordCategory, RecordFormat } from '../schemas/record.enum';
import { UpdateRecordRequestDTO } from '../dtos/update-record.request.dto';
import { RecordService } from '../services/record.service';
import { SearchRecordResponseDTO } from '../dtos/search-record.response.dto';

@Controller('records')
export class RecordController {
  private readonly logger = new Logger(RecordController.name);

  constructor(
    private readonly recordService: RecordService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new record' })
  @ApiResponse({ status: 201, description: 'Record successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() request: CreateRecordRequestDTO): Promise<Record> {
    this.logger.log('Creating record');
    return await this.recordService.create(request);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing record' })
  @ApiResponse({ status: 200, description: 'Record updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Cannot find record to update' })
  async update(
    @Param('id') id: string,
    @Body() updateRecordDto: UpdateRecordRequestDTO,
  ): Promise<Record> {
    this.logger.log(`Updating record ${id}`);
    return await this.recordService.update(id, updateRecordDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all records with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of records',
    type: SearchRecordResponseDTO,
  })
  @ApiQuery({
    name: 'limitPage',
    required: true,
    default: 4,
    description:
      'Limit results per page',
    type: Number,
  })
  @ApiQuery({
    name: 'lastId',
    required: false,
    default: '',
    description:
      'Last ID returned in the search, it is the current cursor',
    type: String,
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description:
      'Search query (search across multiple fields like artist, album, category, etc.)',
    type: String,
  })
  @ApiQuery({
    name: 'artist',
    required: false,
    description: 'Filter by artist name',
    type: String,
  })
  @ApiQuery({
    name: 'album',
    required: false,
    description: 'Filter by album name',
    type: String,
  })
  @ApiQuery({
    name: 'format',
    required: false,
    description: 'Filter by record format (Vinyl, CD, etc.)',
    enum: RecordFormat,
    type: String,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by record category (e.g., Rock, Jazz)',
    enum: RecordCategory,
    type: String,
  })
  async findAll(
    @Query('limit') limit: number = 4,
    @Query('lastId') lastId?: string,
    @Query('q') q?: string,
    @Query('artist') artist?: string,
    @Query('album') album?: string,
    @Query('format') format?: RecordFormat,
    @Query('category') category?: RecordCategory,
  ): Promise<SearchRecordResponseDTO> {
    this.logger.log('Searching record');
    return await this.recordService.find(limit, lastId, q, artist, album, format, category);
  }
}
