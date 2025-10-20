import { PartialType } from '@nestjs/mapped-types';
import { CreateBoxDto } from './create-box.dto';
import { IsEnum, IsOptional, Matches } from 'class-validator';
import { BoxStatus } from '../../../domain/boxes/enums/box-status.enum';

export class UpdateBoxDto extends PartialType(CreateBoxDto) {
  @IsOptional()
  @Matches(/^[A-Z0-9-_]{3,32}$/)
  label?: string;

  @IsOptional()
  @IsEnum(BoxStatus)
  status?: BoxStatus;
}
