import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarrantyService } from './warranty.service';
import { WarrantyController } from './warranty.controller';
import { WarrantyRecord } from './entities/warrantyrecord.entity';
import { WarrantyLog } from './entities/warrantylog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WarrantyRecord, WarrantyLog])],
  controllers: [WarrantyController],
  providers: [WarrantyService],
  exports: [WarrantyService], // Make WarrantyService available for other modules
})
export class WarrantyModule {}
