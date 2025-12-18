import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flashsell } from './flashsell.entity';
import { ObjectId } from 'mongodb';
import { ProductService } from '../products/products.service';
import { Product } from '../products/entities/product-new.entity';

@Injectable()
export class FlashsellService {
  constructor(
    @InjectRepository(Flashsell)
    private readonly flashsellRepository: Repository<Flashsell>,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
  ) {}

  async create(data: Partial<Flashsell>) {
    const flashsell = this.flashsellRepository.create(data);
    return await this.flashsellRepository.save(flashsell);
  }

  async findAll() {
    return await this.flashsellRepository.find();
  }

  async findOne(id: string | ObjectId) {
    let objectId: ObjectId;
    if (typeof id === 'string') {
      try {
        objectId = new ObjectId(id);
      } catch {
        throw new NotFoundException('Invalid Flashsell id');
      }
    } else {
      objectId = id;
    }
    const flashsell = await this.flashsellRepository.findOne({ where: { _id: objectId } } as any);
    if (!flashsell) throw new NotFoundException('Flashsell not found');
    let products: Product[] = [];
    let productIds: string[] = [];
    if (Array.isArray(flashsell.productIds)) {
      productIds = flashsell.productIds;
    } else if (typeof flashsell.productIds === 'string') {
      try {
        productIds = JSON.parse(flashsell.productIds);
      } catch {
        productIds = [];
      }
    }
    if (productIds.length > 0) {
      products = await this.productService.findByIds(productIds);
    }
    return { ...flashsell, products };
  }

  async update(id: string | ObjectId, data: Partial<Flashsell>) {
    let objectId: ObjectId;
    if (typeof id === 'string') {
      try {
        objectId = new ObjectId(id);
      } catch {
        throw new NotFoundException('Invalid Flashsell id');
      }
    } else {
      objectId = id;
    }
    const flashsell = await this.flashsellRepository.findOne({ where: { _id: objectId } } as any);
    if (!flashsell) throw new NotFoundException('Flashsell not found');
    Object.assign(flashsell, data);
    return await this.flashsellRepository.save(flashsell);
  }

  async remove(id: string | ObjectId) {
    let objectId: ObjectId;
    if (typeof id === 'string') {
      try {
        objectId = new ObjectId(id);
      } catch {
        throw new NotFoundException('Invalid Flashsell id');
      }
    } else {
      objectId = id;
    }
    await this.flashsellRepository.delete(objectId);
    return { success: true };
  }
}
