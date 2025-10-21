import { IsArray, IsString } from 'class-validator';

export class AddProductsDto {
  @IsArray()
  @IsString({ each: true })
  productIds!: string[];
}
