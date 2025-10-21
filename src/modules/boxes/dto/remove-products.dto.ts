import { IsArray, IsString } from 'class-validator';

export class RemoveProductsDto {
  @IsArray()
  @IsString({ each: true })
  productIds!: string[];
}
