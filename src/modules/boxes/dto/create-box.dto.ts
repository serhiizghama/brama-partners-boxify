import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { BoxStatus } from '../../../domain/boxes/enums/box-status.enum';

export class CreateBoxDto {
  @ApiProperty({ example: 'BOX-001', description: 'The unique label of the box (3-32 characters, uppercase letters, numbers, and dashes allowed)' })
  @Matches(/^[A-Z0-9-_]{3,32}$/)
  label!: string;

  @ApiProperty({ enum: BoxStatus, example: BoxStatus.CREATED, description: 'The status of the box', required: false })
  @IsOptional()
  @IsEnum(BoxStatus)
  status?: BoxStatus; // optional; default is CREATED in entity

  @ApiProperty({ description: 'An array of product IDs to include in the box', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];
}
