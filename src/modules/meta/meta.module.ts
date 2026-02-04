import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MetaService } from './meta.service';
import { MetaController } from './meta.controller';

@Module({
  imports: [HttpModule],
  providers: [MetaService],
  controllers: [MetaController],
})
export class MetaModule {}
