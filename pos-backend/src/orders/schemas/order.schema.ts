import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export class OrderItem {
  productId: Types.ObjectId;
  productName: string;
  quantity: number;
  priceAtSale: number;
  note?: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ required: true, enum: ['Dine In', 'To Go', 'Delivery'] })
  type: string;

  @Prop()
  tableNo?: string;

  @Prop({
    type: [
      {
        productId: { type: Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        priceAtSale: { type: Number, required: true },
        note: { type: String, default: '' },
      },
    ],
    required: true,
  })
  items: OrderItem[];

  @Prop({ default: 0, min: 0 })
  discount: number;

  @Prop({ required: true, min: 0 })
  subTotal: number;

  @Prop({
    required: true,
    enum: ['Completed', 'Preparing', 'Pending', 'Cancelled'],
    default: 'Completed',
  })
  status: string;

  @Prop({ required: true, enum: ['Credit Card', 'PayPal', 'Cash'] })
  paymentMethod: string;

  @Prop()
  customerName?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
