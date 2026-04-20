import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

export class RecipeItem {
  rawMaterialId!: Types.ObjectId;
  quantityRequired!: number;
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  category!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ default: '' })
  image!: string;

  @Prop({
    type: [
      {
        rawMaterialId: { type: Types.ObjectId, ref: 'RawMaterial', required: true },
        quantityRequired: { type: Number, required: true, min: 0 },
      },
    ],
    default: [],
  })
  recipe!: RecipeItem[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
