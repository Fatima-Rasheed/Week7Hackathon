import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { StockService } from '../stock/stock.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectConnection()
    private connection: Connection,
    private stockService: StockService,
  ) {}

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ORD-${timestamp}${random}`;
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    // Step 1: Verify stock availability before starting transaction
    await this.stockService.verifyOrderStock(
      dto.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    );

    // Step 2: Run deduction inside a MongoDB transaction
    const session = await this.connection.startSession();
    let savedOrder: OrderDocument;

    try {
      await session.withTransaction(async () => {
        // Deduct stock atomically
        await this.stockService.deductStock(
          dto.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          session,
        );

        // Save the order
        const order = new this.orderModel({
          ...dto,
          orderNumber: this.generateOrderNumber(),
          status: 'Completed',
          discount: dto.discount ?? 0,
        });

        const [created] = await this.orderModel.create([order], { session });
        savedOrder = created;
      });
    } finally {
      await session.endSession();
    }

    return savedOrder!;
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    const validStatuses = ['Completed', 'Preparing', 'Pending', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }
    const updated = await this.orderModel
      .findByIdAndUpdate(id, { status }, { returnDocument: 'after' })
      .exec();
    if (!updated) throw new NotFoundException(`Order ${id} not found`);
    return updated;
  }
}
