import { IsString, Length, Matches } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @Length(2, 100)
  name!: string;

  @IsString()
  @Length(8, 32)
  @Matches(/^[\w-]+$/)
  barcode!: string;
}
