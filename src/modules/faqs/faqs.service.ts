
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';
import { FAQ } from './entities/faq.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class FaqsService {

  constructor(
    @InjectRepository(FAQ)
    private readonly faqRepository: Repository<FAQ>,
  ) { }


  async create(dto: CreateFaqDto) {
    const faq = this.faqRepository.create(dto);
    return this.faqRepository.save(faq);
  }


  async findAll() {
    return this.faqRepository.find({
      where: { productId: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }


  async findByProduct(productId: string) {
    return this.faqRepository.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
  }



  async findOne(id: string | ObjectId) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const faq = await this.faqRepository.findOne({ where: { id: _id } });
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }



  async update(id: string | ObjectId, dto: UpdateFaqDto) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await this.faqRepository.update(_id, dto);
    return this.faqRepository.findOne({ where: { id: _id } });
  }



  async remove(id: string | ObjectId) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await this.faqRepository.delete(_id);
    return { success: true };
  }
}
