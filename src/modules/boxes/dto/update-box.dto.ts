import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { BoxStatus } from '../../../domain/boxes/enums/box-status.enum';

export class UpdateBoxDto {
  @ApiProperty({ example: 'BOX-002', description: 'The new unique label of the box (3-32 characters, uppercase letters, numbers, and dashes allowed)', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9-_]{3,32}$/, {
    message: 'Label must match pattern [A-Z0-9-_]{3,32}',
  })
  label?: string;

  @ApiProperty({ enum: BoxStatus, example: BoxStatus.SEALED, description: 'The new status of the box', required: false })
  @IsOptional()
  @IsEnum(BoxStatus, {
    message: 'Status must be one of: CREATED, SEALED, SHIPPED',
  })
  status?: BoxStatus;
}