import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class ListProductsQuery {
  @ApiProperty({ description: 'The number of items to return', default: 20, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @IsPositive()
  limit = 20;

  @ApiProperty({ description: 'The number of items to skip', default: 0, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(0)
  offset = 0;

  @ApiProperty({ description: 'A search term to filter by name or barcode', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'The field to sort by', enum: ['name', 'barcode', 'created_at', 'updated_at'], default: 'created_at', required: false })
  @IsOptional()
  @IsIn(['name', 'barcode', 'created_at', 'updated_at'])
  sort_by: 'name' | 'barcode' | 'created_at' | 'updated_at' = 'created_at';

  @ApiProperty({ description: 'The sort direction', enum: ['asc', 'desc'], default: 'desc', required: false })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  direction: 'asc' | 'desc' = 'desc';
}
