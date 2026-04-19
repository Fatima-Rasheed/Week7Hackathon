import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RawMaterial, RawMaterialDocument } from './schemas/raw-material.schema';
import { CreateRawMaterialDto } from './dto/create-raw-material.dto';
import { UpdateRawMaterialDto } from './dto/update-raw-material.dto';

@Injectable()
export class RawMaterialsService {
  constructor(
    @InjectModel(RawMaterial.name)
    private rawMaterialModel: Model<RawMaterialDocument>,
  ) {}

  async create(dto: CreateRawMaterialDto): Promise<RawMaterial> {
    const created = new this.rawMaterialModel(dto);
    return created.save();
  }

  async findAll(): Promise<RawMaterial[]> {
    return this.rawMaterialModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<RawMaterialDocument> {
    const material = await this.rawMaterialModel.findById(id).exec();
    if (!material) {
      throw new NotFoundException(`Raw material ${id} not found`);
    }
    return material;
  }

  async update(id: string, dto: UpdateRawMaterialDto): Promise<RawMaterial> {
    const updated = await this.rawMaterialModel
      .findByIdAndUpdate(id, dto, { returnDocument: 'after' })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Raw material ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.rawMaterialModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Raw material ${id} not found`);
    }
  }

  async findLowStock(): Promise<RawMaterial[]> {
    return this.rawMaterialModel
      .find({
        minStockAlert: { $exists: true, $ne: null },
        $expr: { $lte: ['$currentStock', '$minStockAlert'] },
      })
      .exec();
  }
}
