import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class RemoveProductsDto {
  @ApiProperty({ description: 'An array of product IDs to remove from the box', type: [String] })
  @IsArray()
  @IsString({ each: true })
  productIds!: string[];
}
