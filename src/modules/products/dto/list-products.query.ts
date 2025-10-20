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
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @IsPositive()
  limit = 20;

  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(0)
  offset = 0;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['name', 'barcode', 'created_at', 'updated_at'])
  sort_by: 'name' | 'barcode' | 'created_at' | 'updated_at' = 'created_at';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  direction: 'asc' | 'desc' = 'desc';
}
