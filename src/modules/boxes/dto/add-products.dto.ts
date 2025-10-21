import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class AddProductsDto {
  @ApiProperty({ description: 'An array of product IDs to add to the box', type: [String] })
  @IsArray()
  @IsString({ each: true })
  productIds!: string[];
}
