import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({ example: 'My Updated Product', description: 'The new name of the product (2-100 characters)', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiProperty({ example: 'PROD-87654321', description: 'The new unique barcode of the product (8-32 characters, alphanumeric and dashes allowed)', required: false })
  @IsOptional()
  @IsString()
  @Length(8, 32)
  @Matches(/^[\w-]+$/)
  barcode?: string;
}
