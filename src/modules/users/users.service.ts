import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { Wishlist } from './entities/wishlist.entity';
import { Compare } from './entities/compare.entity';
import { Order } from '../orders/entities/order.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Compare)
    private readonly compareRepository: Repository<Compare>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) { }


  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existing = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
    let name = createUserDto.name;
    if (!name) {
      name = (createUserDto.email || '').split('@')[0];
    }
    const role: string = typeof createUserDto.role === 'string' ? createUserDto.role : 'user';
    const isAdmin = role === 'admin';
    let hashedPassword: string | undefined = undefined;
    if (typeof createUserDto.password === 'string' && createUserDto.password.length > 0) {
      hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    }
    const user = this.userRepository.create({
      email: createUserDto.email,
      name,
      role,
      isAdmin,
      ...(hashedPassword ? { password: hashedPassword } : {}),
    });
    const saved = await this.userRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = saved as User & { password?: string };
    return rest;
  }


  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find();
    return users.map((u) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = u as User & { password?: string };
      return rest;
    });
  }


  async updateRole(id: string | ObjectId, role: string): Promise<Omit<User, 'password'>> {
    const validRoles = ['user', 'admin', 'management'];
    if (!validRoles.includes(role)) throw new BadRequestException('Invalid role');
    const isAdmin = role === 'admin';
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const user = await this.userRepository.findOne({ where: { id: _id } });
    if (!user) throw new NotFoundException('User not found');
    user.role = role;
    user.isAdmin = isAdmin;
    const saved = await this.userRepository.save(user);
    const { password, ...rest } = saved as User & { password?: string };
    return rest;
  }


  async findOne(id: string | ObjectId): Promise<Omit<User, 'password'>> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const user = await this.userRepository.findOne({ where: { id: _id } });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...rest } = user as User & { password?: string };
    return rest;
  }


  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }


  async update(id: string | ObjectId, payload: Partial<CreateUserDto>): Promise<Omit<User, 'password'>> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const user = await this.userRepository.findOne({ where: { id: _id } });
    if (!user) throw new NotFoundException('User not found');
    if (typeof payload.password === 'string' && payload.password.length > 0) {
      user.password = await bcrypt.hash(payload.password, 10);
    }
    Object.assign(user, payload);
    const saved = await this.userRepository.save(user);
    const { password, ...rest } = saved as User & { password?: string };
    return rest;
  }


  async remove(id: string | ObjectId): Promise<{ success: boolean }> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await this.userRepository.delete(_id);
    return { success: true };
  }


  async getWishlist(userId: string) {
    return this.wishlistRepository.find({ where: { userId } });
  }


  async addToWishlist(userId: string, productId: string) {
    const wishlist = this.wishlistRepository.create({ userId, productId });
    return this.wishlistRepository.save(wishlist);
  }


  async removeFromWishlist(userId: string, productId: string) {
    const wishlist = await this.wishlistRepository.findOne({ where: { userId, productId } });
    if (wishlist) {
      await this.wishlistRepository.delete(wishlist.id);
    }
    return { success: true };
  }


  async getCompare(userId: string) {
    return this.compareRepository.find({ where: { userId } });
  }


  async addToCompare(userId: string, productId: string) {
    const compare = this.compareRepository.create({ userId, productId });
    return this.compareRepository.save(compare);
  }


  async removeFromCompare(userId: string, productId: string) {
    const compare = await this.compareRepository.findOne({ where: { userId, productId } });
    if (compare) {
      await this.compareRepository.delete(compare.id);
    }
    return { success: true };
  }


  async getOrders(userId: string) {
    // TODO: Filter by userId if Order entity has a customer field with id
    return this.orderRepository.find({ order: { createdAt: 'DESC' } });
  }
}
