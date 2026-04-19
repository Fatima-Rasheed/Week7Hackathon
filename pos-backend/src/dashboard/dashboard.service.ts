import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { RawMaterialsService } from '../raw-materials/raw-materials.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    private rawMaterialsService: RawMaterialsService,
  ) {}

  async getSummary() {
    // Total revenue
    const revenueResult = await this.orderModel.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$subTotal' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total ?? 0;

    // Total orders count
    const totalOrders = await this.orderModel.countDocuments();

    // Total non-cancelled orders (representing valid customers)
    const completedOrders = await this.orderModel.countDocuments({
      status: { $ne: 'Cancelled' },
    });

    // Total dishes ordered
    const totalDishesResult = await this.orderModel.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: null, total: { $sum: '$items.quantity' } } },
    ]);
    const totalDishes = totalDishesResult[0]?.total ?? 0;

    // Most ordered products (top 5)
    const mostOrdered = await this.orderModel.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      {
        $project: {
          _id: 1,
          productName: 1,
          totalQuantity: 1,
          image: { $ifNull: [{ $arrayElemAt: ['$productInfo.image', 0] }, ''] },
        },
      },
    ]);

    // Order type breakdown
    const orderTypeBreakdown = await this.orderModel.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent orders (last 20)
    const recentOrders = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();

    // Low stock raw materials
    const lowStockMaterials = await this.rawMaterialsService.findLowStock();

    // Revenue by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const revenueByDay = await this.orderModel.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelled' },
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$subTotal' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      totalRevenue,
      totalOrders,
      completedOrders,
      totalDishes,
      mostOrdered,
      orderTypeBreakdown,
      recentOrders,
      lowStockMaterials,
      revenueByDay,
    };
  }
}
