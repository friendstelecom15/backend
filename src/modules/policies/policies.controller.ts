import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PoliciesService } from './policies.service';
import { CreatePolicyDto, UpdatePolicyDto } from './dto/policy.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('policies')
@Controller('policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create policy (Admin only)' })
  async create(@Body() dto: CreatePolicyDto) {
    const policy = await this.policiesService.create(dto);
    return { ...policy, id: policy.id?.toString?.() ?? String(policy.id) };
  }

  @Get()
  @ApiOperation({ summary: 'Get all policies' })
  async findAll() {
    const policies = await this.policiesService.findAll();
    return policies.map(p => ({ ...p, id: p.id?.toString?.() ?? String(p.id) }));
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get policy by slug' })
  async findOne(@Param('slug') slug: string) {
    const policy = await this.policiesService.findOne(slug);
    return { ...policy, id: policy.id?.toString?.() ?? String(policy.id) };
  }

  @Patch(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update policy (Admin only)' })
  async update(@Param('slug') slug: string, @Body() dto: UpdatePolicyDto) {
    const policy = await this.policiesService.update(slug, dto);
    return { ...policy, id: policy.id?.toString?.() ?? String(policy.id) };
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete policy (Admin only)' })
  async remove(@Param('slug') slug: string) {
    return await this.policiesService.remove(slug);
  }
}
