import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { RawMaterial, RawMaterialDocument } from '../raw-materials/schemas/raw-material.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

@Injectable()
export class StockService {
  constructor(
    @InjectModel(RawMaterial.name)
    private rawMaterialModel: Model<RawMaterialDocument>,
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}

  /**
   * Calculate how many units of a product can be made given current raw material stock.
   * Returns the minimum across all recipe ingredients.
   */
  async calculateAvailability(productId: string): Promise<number> {
    const product = await this.productModel.findById(productId).exec();
    if (!product) return 0;
    if (!product.recipe || product.recipe.length === 0) return 9999;

    let minAvailable = Infinity;

    for (const item of product.recipe) {
      const material = await this.rawMaterialModel
        .findById(item.rawMaterialId)
        .exec();
      if (!material) return 0;
      if (item.quantityRequired <= 0) continue;
      const canMake = Math.floor(material.currentStock / item.quantityRequired);
      if (canMake < minAvailable) {
        minAvailable = canMake;
      }
    }

    return minAvailable === Infinity ? 0 : minAvailable;
  }

  /**
   * Verify all items in an order have sufficient stock.
   * Throws BadRequestException if any item cannot be fulfilled.
   */
  async verifyOrderStock(items: OrderItemInput[]): Promise<void> {
    // Aggregate required raw materials across all order items
    const required = new Map<string, number>();

    for (const orderItem of items) {
      const product = await this.productModel
        .findById(orderItem.productId)
        .exec();
      if (!product) {
        throw new BadRequestException(
          `Product ${orderItem.productId} not found`,
        );
      }

      for (const recipeItem of product.recipe) {
        const matId = recipeItem.rawMaterialId.toString();
        const needed = recipeItem.quantityRequired * orderItem.quantity;
        required.set(matId, (required.get(matId) ?? 0) + needed);
      }
    }

    // Check each raw material has enough stock
    for (const [matId, needed] of required.entries()) {
      const material = await this.rawMaterialModel.findById(matId).exec();
      if (!material) {
        throw new BadRequestException(`Raw material ${matId} not found`);
      }
      if (material.currentStock < needed) {
        throw new BadRequestException(
          `Insufficient stock for "${material.name}". ` +
            `Required: ${needed} ${material.unit}, Available: ${material.currentStock} ${material.unit}`,
        );
      }
    }
  }

  /**
   * Deduct raw materials for a completed order.
   * Must be called inside a MongoDB session/transaction.
   */
  async deductStock(
    items: OrderItemInput[],
    session: ClientSession,
  ): Promise<void> {
    const required = new Map<string, number>();

    for (const orderItem of items) {
      const product = await this.productModel
        .findById(orderItem.productId)
        .session(session)
        .exec();
      if (!product) continue;

      for (const recipeItem of product.recipe) {
        const matId = recipeItem.rawMaterialId.toString();
        const needed = recipeItem.quantityRequired * orderItem.quantity;
        required.set(matId, (required.get(matId) ?? 0) + needed);
      }
    }

    for (const [matId, needed] of required.entries()) {
      await this.rawMaterialModel
        .findByIdAndUpdate(
          matId,
          { $inc: { currentStock: -needed } },
          { session, returnDocument: 'after' },
        )
        .exec();
    }
  }
}
