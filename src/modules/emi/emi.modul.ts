import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Emi } from './entities/emi.entity';
import { Bank } from './entities/bank.entity';
import { EmiService } from './emi.service';
import { EmiController } from './emi.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Emi, Bank])],
  providers: [EmiService],
  controllers: [EmiController],
  exports: [EmiService],
})
export class EmiModule {}
