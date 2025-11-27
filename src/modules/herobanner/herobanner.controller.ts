import { Controller, Get, Post, Body, Param, Patch, Delete, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { HerobannerService } from './herobanner.service';
import { FileUpload, UploadType } from '../../common/decorators/file-upload.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('herobanner')
export class HerobannerController {
    constructor(private readonly herobannerService: HerobannerService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'management')
    @FileUpload('img', 1, undefined, UploadType.IMAGE)
    async create(@UploadedFile() file: Express.Multer.File) {
        const banner = await this.herobannerService.create({ img: file?.path || file?.filename || '' });
        return { ...banner, id: banner.id?.toString?.() ?? String(banner.id) };
    }

    @Get()
    async findAll() {
        const all = await this.herobannerService.findAll();
        return all.map(banner => ({ ...banner, id: banner.id?.toString?.() ?? String(banner.id) }));
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const banner = await this.herobannerService.findOne(id);
        return { ...banner, id: banner.id?.toString?.() ?? String(banner.id) };
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'management')
    @FileUpload('img', 1, undefined, UploadType.IMAGE)
    async update(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        const banner = await this.herobannerService.update(id, { img: file?.path || file?.filename || '' });
        return { ...banner, id: banner.id?.toString?.() ?? String(banner.id) };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'management')
    async remove(@Param('id') id: string) {
        return await this.herobannerService.remove(id);
    }
}
