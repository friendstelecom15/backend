import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { Blog } from './entities/blog.entity';
import { FileFieldsUpload, UploadType } from '../../common/decorators/file-upload.decorator';
import { CloudflareService } from 'src/config/cloudflare-video.service';
import { UploadedFiles } from '@nestjs/common';

@Controller('blogs')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly cloudflareService: CloudflareService,
  ) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.blogService.findAll(page, limit, search, category);
  }



  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.blogService.findOneBySlug(slug);
  }


  @Post()
  @UseGuards(/*JwtAuthGuard,*/ /*RolesGuard*/)
  // Uncomment JwtAuthGuard and RolesGuard as needed
  // @Roles('admin', 'editor') // Uncomment and adjust roles as needed
  @FileFieldsUpload(
    [{ name: 'image', maxCount: 1 }],
    undefined,
    UploadType.IMAGE,
  )
  async create(
    @Body() blogData: Partial<Blog>,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ) {
    // You may want to use a CreateBlogDto instead of Partial<Blog>
    if (files?.image?.length) {
      const file = files.image[0];
      try {
        const upload = await this.cloudflareService.uploadImage(file.buffer, file.originalname);
        blogData.image = upload.variants?.[0] || upload.id || upload.filename || '';
      } catch (err) {
        throw new Error(`Cloudflare image upload failed: ${err}`);
      }
    }
    return this.blogService.create(blogData);
  }

  @Put(':id')
  // @UseGuards(RolesGuard)
  async update(@Param('id') id: string, @Body() blogData: Partial<Blog>) {
    return this.blogService.update(id, blogData);
  }

  @Delete(':id')
  // @UseGuards(RolesGuard)
  async remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
