import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Emi } from './entities/emi.entity';
import { Bank } from './entities/bank.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class EmiService {
  constructor(
    @InjectRepository(Emi)
    private readonly emiRepository: Repository<Emi>,
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
  ) {}

  async createEmi(dto: any) {
    const emi = this.emiRepository.create(dto);
    return this.emiRepository.save(emi);
  }

  async updateEmi(id: string, dto: any) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await this.emiRepository.update(_id, dto);
    return this.emiRepository.findOne({ where: { _id } } as any);
  }

  async getAllEmis() {
    const emis = await this.emiRepository.find();
    const result: any[] = [];
    for (const emi of emis) {
      let bankName: string = '';
      if (emi.bankId) {
        let bankObjectId;
        try {
          bankObjectId = new ObjectId(emi.bankId);
        } catch {
          bankObjectId = emi.bankId;
        }
        const bank = await this.bankRepository.findOne({ where: { _id: bankObjectId } } as any);
        bankName = bank?.bankname || '';
      }
      result.push({
        ...emi,
        bankName,
      });
    }
    return result;
  }

  async getEmi(id: string) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const emi = await this.emiRepository.findOne({ where: { _id } } as any);
    let bankName: string = '';
    if (emi?.bankId) {
      const bank = await this.bankRepository.findOne({ where: { _id: emi.bankId } } as any);
      bankName = bank?.bankname || '';
    }
    return {
      ...emi,
      bankName,
    };
  }

  async removeEmi(id: string) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await this.emiRepository.delete(_id);
    return { success: true };
  }

  async getAllBanks() {
    return this.bankRepository.find();
  }

  async getBank(id: string) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    return this.bankRepository.findOne({ where: { _id } } as any);
  }

  async createBank(dto: any) {
    if (!dto.bankname || typeof dto.bankname !== 'string' || !dto.bankname.trim()) {
      throw new BadRequestException('Bank name (bankname) is required and must be a non-empty string.');
    }
    const bank = this.bankRepository.create(dto);
    return this.bankRepository.save(bank);
  }

  async updateBank(id: string, dto: any) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await this.bankRepository.update(_id, dto);
    return this.bankRepository.findOne({ where: { _id } } as any);
  }

  async removeBank(id: string) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await this.bankRepository.delete(_id);
    return { success: true };
  }
}
