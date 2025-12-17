import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flashsell } from './flashsell.entity';
import { FlashsellService } from './flashsell.service';
import { FlashsellController } from './flashsell.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Flashsell])],
  controllers: [FlashsellController],
  providers: [FlashsellService],
  exports: [FlashsellService],
})
export class FlashsellModule {}
