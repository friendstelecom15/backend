
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';
import { FAQ } from './entities/faq.entity';

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



  async findOne(id: string) {
    const faq = await this.faqRepository.findOne({ where: { id } });
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }



  async update(id: string, dto: UpdateFaqDto) {
    await this.faqRepository.update(id, dto);
    return this.faqRepository.findOne({ where: { id } });
  }



  async remove(id: string) {
    await this.faqRepository.delete(id);
    return { success: true };
  }
}
