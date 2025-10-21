import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'My Awesome Product', description: 'The name of the product (2-100 characters)' })
  @IsString()
  @Length(2, 100)
  name!: string;

  @ApiProperty({ example: 'PROD-12345678', description: 'The unique barcode of the product (8-32 characters, alphanumeric and dashes allowed)' })
  @IsString()
  @Length(8, 32)
  @Matches(/^[\w-]+$/)
  barcode!: string;
}
