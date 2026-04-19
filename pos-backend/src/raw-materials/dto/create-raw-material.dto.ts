import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

export class CreateRawMaterialDto {
  @IsString()
  name: string;

  @IsEnum(['g', 'ml', 'pcs'])
  unit: string;

  @IsNumber()
  @Min(0)
  currentStock: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minStockAlert?: number;
}
