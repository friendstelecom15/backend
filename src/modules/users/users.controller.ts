import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(dto);
    const result: UserResponseDto = {
      id: user.id?.toString?.() ?? String(user.id),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      image: typeof user?.image === 'string' ? user.image : undefined,
      roles: user.role ? [String(user.role)] : [],
    };
    return result;
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  async all() {
    const users = await this.usersService.findAll();
    return users.map(user => ({
      ...user,
      id: user.id?.toString?.() ?? String(user.id),
      roles: user.role ? [String(user.role)] : [],
    }));
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(user => ({
      ...user,
      id: user.id?.toString?.() ?? String(user.id),
      roles: user.role ? [String(user.role)] : [],
    }));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);
    return {
      ...user,
      id: user.id?.toString?.() ?? String(user.id),
      roles: user.role ? [String(user.role)] : [],
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const maybeRole = (dto as { role?: unknown }).role;
    if (typeof maybeRole === 'string') {
      return this.usersService.updateRole(id, maybeRole);
    }

    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    await this.usersService.remove(id);
  }

  @Get(':id/wishlist')
  @UseGuards(JwtAuthGuard)
  async getWishlist(@Param('id') id: string) {
    return this.usersService.getWishlist(id);
  }

  @Post(':id/wishlist')
  @UseGuards(JwtAuthGuard)
  async addToWishlist(
    @Param('id') id: string,
    @Body('productId') productId: string,
  ) {
    return this.usersService.addToWishlist(id, productId);
  }

  @Delete(':id/wishlist/:productId')
  @UseGuards(JwtAuthGuard)
  async removeFromWishlist(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    return this.usersService.removeFromWishlist(id, productId);
  }

  @Get(':id/compare')
  @UseGuards(JwtAuthGuard)
  async getCompare(@Param('id') id: string) {
    return this.usersService.getCompare(id);
  }

  @Post(':id/compare')
  @UseGuards(JwtAuthGuard)
  async addToCompare(
    @Param('id') id: string,
    @Body('productId') productId: string,
  ) {
    return this.usersService.addToCompare(id, productId);
  }

  @Delete(':id/compare/:productId')
  @UseGuards(JwtAuthGuard)
  async removeFromCompare(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    return this.usersService.removeFromCompare(id, productId);
  }

  @Get(':id/orders')
  @UseGuards(JwtAuthGuard)
  async getOrders(@Param('id') id: string) {
    return this.usersService.getOrders(id);
  }
}
