import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { BoxStatus } from '../../../domain/boxes/enums/box-status.enum';

export class UpdateBoxDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9-_]{3,32}$/, {
    message: 'Label must match pattern [A-Z0-9-_]{3,32}',
  })
  label?: string;

  @IsOptional()
  @IsEnum(BoxStatus, {
    message: 'Status must be one of: CREATED, SEALED, SHIPPED',
  })
  status?: BoxStatus;
}