import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockService } from './stock.service';
import { RawMaterial, RawMaterialSchema } from '../raw-materials/schemas/raw-material.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RawMaterial.name, schema: RawMaterialSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
