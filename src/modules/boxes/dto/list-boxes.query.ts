import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { BoxStatus } from '../../../domain/boxes/box-status.enum';

export class ListBoxesQuery {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsPositive()
  limit = 20;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  offset = 0;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(BoxStatus)
  status?: BoxStatus;

  @IsOptional()
  @IsIn(['label', 'status', 'created_at', 'updated_at'])
  sort_by: 'label' | 'status' | 'created_at' | 'updated_at' = 'created_at';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  direction: 'asc' | 'desc' = 'desc';
}
