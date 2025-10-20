import { IsEnum, IsOptional, Matches } from 'class-validator';
import { BoxStatus } from '../../../domain/boxes/box-status.enum';

export class CreateBoxDto {
  @Matches(/^[A-Z0-9-_]{3,32}$/)
  label!: string;

  @IsOptional()
  @IsEnum(BoxStatus)
  status?: BoxStatus; // optional; default is CREATED in entity
}
