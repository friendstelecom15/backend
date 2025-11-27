import { Module } from '@nestjs/common';
import { GiveawaysService } from './giveaways.service';
import { GiveawaysController } from './giveaways.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiveawayEntry } from './entities/giveawayentry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GiveawayEntry])],
  controllers: [GiveawaysController],
  providers: [GiveawaysService],
  exports: [GiveawaysService],
})
export class GiveawaysModule { }
