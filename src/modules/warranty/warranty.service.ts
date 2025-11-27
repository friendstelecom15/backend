import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ActivateWarrantyDto, WarrantyLookupDto } from './dto/warranty.dto';
import { WarrantyRecord } from './entities/warrantyrecord.entity';
import { WarrantyLog } from './entities/warrantylog.entity';

@Injectable()
export class WarrantyService {
  constructor(
    @InjectRepository(WarrantyRecord)
    private readonly warrantyRepo: Repository<WarrantyRecord>,
    @InjectRepository(WarrantyLog)
    private readonly logRepo: Repository<WarrantyLog>,
  ) { }

  private toJsonValue(data: unknown): any {
    try {
      return JSON.parse(JSON.stringify(data));
    } catch {
      return { error: 'Could not serialize data' };
    }
  }

  async activate(dto: ActivateWarrantyDto, adminUsername?: string) {
    // Check for duplicate IMEI or serial
    if (dto.imei) {
      const exists = await this.warrantyRepo.findOne({ where: { imei: dto.imei } });
      if (exists) throw new ConflictException('Warranty with this IMEI already exists');
    }
    if (dto.serial) {
      const exists = await this.warrantyRepo.findOne({ where: { serial: dto.serial } });
      if (exists) throw new ConflictException('Warranty with this serial already exists');
    }
    const purchaseDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const warranty = this.warrantyRepo.create({
      id: uuidv4(),
      ...dto,
      purchaseDate,
      expiryDate,
      status: 'active',
      activatedBy: adminUsername || 'system',
    });
    const savedWarranty = await this.warrantyRepo.save(warranty);
    const log = this.logRepo.create({
      id: uuidv4(),
      warrantyId: savedWarranty.id,
      action: 'created',
      changes: this.toJsonValue(dto),
      admin: adminUsername || 'system',
    });
    await this.logRepo.save(log);
    return { ...savedWarranty, id: savedWarranty.id };
  }

  async lookup(dto: WarrantyLookupDto) {
    const warranty = await this.warrantyRepo.findOne({ where: { imei: dto.imei } });
    if (!warranty) throw new NotFoundException('Warranty not found');
    const logs = await this.logRepo.find({ where: { warrantyId: warranty.id } });
    return {
      ...warranty,
      id: warranty.id,
      logs,
    };
  }

  async getLogs(id: string) {
    const logs = await this.logRepo.find({ where: { warrantyId: id } });
    return logs;
  }
}
