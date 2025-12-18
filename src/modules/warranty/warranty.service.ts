
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivateWarrantyDto, WarrantyLookupDto } from './dto/warranty.dto';
import { WarrantyRecord } from './entities/warrantyrecord.entity';
import { WarrantyLog } from './entities/warrantylog.entity';
import { ObjectId } from 'mongodb';

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
      ...dto,
      purchaseDate,
      expiryDate,
      status: 'active',
      activatedBy: adminUsername || 'system',
    });
    const savedWarranty = await this.warrantyRepo.save(warranty);
    const log = this.logRepo.create({
      warrantyId: String(savedWarranty.id),
      action: 'created',
      changes: this.toJsonValue(dto),
      admin: adminUsername || 'system',
    });
    await this.logRepo.save(log);
    return { ...savedWarranty, id: String(savedWarranty.id) };
  }

  async lookup(dto: WarrantyLookupDto) {
    let warranty: WarrantyRecord | undefined;
    if (dto.imei) {
      warranty = (await this.warrantyRepo.findOne({ where: { imei: dto.imei, phone: dto.phone } })) || undefined;
    } else if (dto.serial) {
      warranty = (await this.warrantyRepo.findOne({ where: { serial: dto.serial, phone: dto.phone } })) ?? undefined;
    }
    if (!warranty) throw new NotFoundException('Warranty not found');
    const logs = await this.logRepo.find({ where: { warrantyId: String(warranty.id) } });
    // Calculate remaining days
    let remainingDays: number | null = null;
    if (warranty.expiryDate) {
      const today = new Date();
      const expiry = new Date(warranty.expiryDate);
      remainingDays = Math.max(0, Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    }
    return {
      ...warranty,
      id: String(warranty.id),
      startDate: warranty.purchaseDate,
      endDate: warranty.expiryDate,
      remainingDays,
      logs,
    };
  }

    async update(id: string, dto: Partial<ActivateWarrantyDto>, adminUsername?: string) {
    const warranty = await this.warrantyRepo.findOne({ where: { id: new ObjectId(id) } });
    if (!warranty) throw new NotFoundException('Warranty not found');
    Object.assign(warranty, dto);
    const saved = await this.warrantyRepo.save(warranty);
    const log = this.logRepo.create({
      warrantyId: String(saved.id),
      action: 'updated',
      changes: this.toJsonValue(dto),
      admin: adminUsername || 'system',
    });
    await this.logRepo.save(log);
    return { ...saved, id: String(saved.id) };
  }

  async delete(id: string, adminUsername?: string) {
    const warranty = await this.warrantyRepo.findOne({ where: { id: new ObjectId(id) } });
    if (!warranty) throw new NotFoundException('Warranty not found');
    await this.warrantyRepo.delete({ id: new ObjectId(id) });
    const log = this.logRepo.create({
      warrantyId: String(id),
      action: 'deleted',
      changes: this.toJsonValue(warranty),
      admin: adminUsername || 'system',
    });
    await this.logRepo.save(log);
    return { success: true };
  }

  async getLogs(id: string | ObjectId) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const logs = await this.logRepo.find({ where: { warrantyId: String(_id) } });
    return logs;
  }
}
