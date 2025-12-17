import { Controller, Get, Post, Body, Param, Patch, Delete, UploadedFiles, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { FileFieldsUpload, UploadType } from '../../common/decorators/file-upload.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CloudflareService } from 'src/config/cloudflare-video.service';
import { FlashsellService } from './flashsell.service';
import { Flashsell } from './flashsell.entity';

@Controller('flashsell')
export class FlashsellController {
  constructor(
    private readonly flashsellService: FlashsellService,
    private readonly cloudflareService: CloudflareService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'management')
  @FileFieldsUpload(
    [{ name: 'bannerImg', maxCount: 1 }],
    undefined,
    UploadType.IMAGE,
  )
  async create(
    @Body() data: Partial<Flashsell>,
    @CurrentUser() user: User,
    @UploadedFiles() files: { bannerImg?: Express.Multer.File[] },
  ) {
    if (!user || !user.id) {
      throw new InternalServerErrorException('Authentication required');
    }
    if (files?.bannerImg?.length) {
      const file = files.bannerImg[0];
      try {
        const upload = await this.cloudflareService.uploadImage(
          file.buffer,
          file.originalname,
        );
        data.bannerImg = upload.variants?.[0] || upload.id || upload.filename || '';
      } catch (err) {
        throw new InternalServerErrorException(
          `Cloudflare image upload failed: ${err}`,
        );
      }
    }
    return await this.flashsellService.create(data);
  }

  @Get()
  async findAll() {
    return await this.flashsellService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.flashsellService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Flashsell>) {
    return await this.flashsellService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.flashsellService.remove(id);
  }
}
