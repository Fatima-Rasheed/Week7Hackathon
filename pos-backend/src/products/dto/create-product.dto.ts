import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RecipeItemDto {
  @IsMongoId()
  rawMaterialId!: string;

  @IsNumber()
  @Min(0)
  quantityRequired!: number;
}

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  category!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  recipe!: RecipeItemDto[];
}
