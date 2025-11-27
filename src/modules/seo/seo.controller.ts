import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SeoService } from './seo.service';

@ApiTags('seo')
@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product SEO metadata' })
  getProductSeo(@Param('id') id: string) {
    return this.seoService.getProductSeo(id);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category SEO metadata' })
  getCategorySeo(@Param('id') id: string) {
    return this.seoService.getCategorySeo(id);
  }

  @Get('brands/:id')
  @ApiOperation({ summary: 'Get brand SEO metadata' })
  getBrandSeo(@Param('id') id: string) {
    return this.seoService.getBrandSeo(id);
  }

  @Get('sitemap')
  @ApiOperation({ summary: 'Generate sitemap data' })
  generateSitemap() {
    return this.seoService.generateSitemap();
  }
}
