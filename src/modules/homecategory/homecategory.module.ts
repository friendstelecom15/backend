import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomecategoryService } from './homecategory.service';
import { HomecategoryController } from './homecategory.controller';
import { HomeCategory } from './entities/homecategory.entity';

@Module({
    imports: [TypeOrmModule.forFeature([HomeCategory])],
    controllers: [HomecategoryController],
    providers: [HomecategoryService],
    exports: [HomecategoryService],
})
export class HomecategoryModule { }
