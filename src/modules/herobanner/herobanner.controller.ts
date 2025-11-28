import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HerobannerService } from './herobanner.service';
import {
  FileUpload,
  FileFieldsUpload,
  UploadType,
} from '../../common/decorators/file-upload.decorator';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateHerobannerDto } from './dto/create.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CloudflareService } from 'src/config/cloudflare-video.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('herobanner')
export class HerobannerController {
  constructor(
    private readonly herobannerService: HerobannerService,
    private readonly cloudflareService: CloudflareService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'management')
  @FileFieldsUpload(
    [{ name: 'img', maxCount: 10 }],
    undefined,
    UploadType.IMAGE,
  )
  async create(
    @Body() createHerobannerDto: CreateHerobannerDto,
    @CurrentUser() user: User,
    @UploadedFiles() files: { img?: Express.Multer.File[] },
  ) {
    if (!user || !user.id) {
      throw new UnauthorizedException(
        'Authentication required to create a course',
      );
    }
    if (files?.img?.length) {
      const file = files.img[0];
      try {
        const upload = await this.cloudflareService.uploadImage(
          file.buffer,
          file.originalname,
        );
        createHerobannerDto.img =
          upload.variants?.[0] || upload.id || upload.filename || '';
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new InternalServerErrorException(
          `Cloudflare image upload failed: ${message}`,
        );
      }
    }
    return await this.herobannerService.create(createHerobannerDto);
  }

  @Get()
  async findAll() {
    const all = await this.herobannerService.findAll();
    return all.map((banner) => ({
      ...banner,
      id: banner.id?.toString?.() ?? String(banner.id),
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const banner = await this.herobannerService.findOne(id);
    return { ...banner, id: banner.id?.toString?.() ?? String(banner.id) };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'management')
  @FileUpload('img', 1, { storage: memoryStorage() }, UploadType.IMAGE)
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let updateData = {};
    if (file && file.buffer) {
      try {
        const upload = await this.cloudflareService.uploadImage(
          file.buffer,
          file.originalname,
        );
        updateData = {
          img: upload.variants?.[0] || upload.id || upload.filename || '',
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new InternalServerErrorException(
          `Cloudflare image upload failed: ${message}`,
        );
      }
    }
    const banner = await this.herobannerService.update(id, updateData);
    return { ...banner, id: banner.id?.toString?.() ?? String(banner.id) };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'management')
  async remove(@Param('id') id: string) {
    return await this.herobannerService.remove(id);
  }
}
