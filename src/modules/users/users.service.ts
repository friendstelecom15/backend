import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';

import { CreateUserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { Wishlist } from './entities/wishlist.entity';
import { Compare } from './entities/compare.entity';
import { Order } from '../orders/entities/order.entity';

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
  ) {}

  // ==========================
  // UTIL
  // ==========================
  private toObjectId(id: string | ObjectId): ObjectId {
    return typeof id === 'string' ? new ObjectId(id) : id;
  }

  private sanitize(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user as User & { password?: string };
    return rest;
  }

  // ==========================
  // CREATE
  // ==========================
  async create(dto: CreateUserDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const name = dto.name ?? dto.email.split('@')[0];
    const role: string = typeof dto.role === 'string' ? dto.role : 'user';

    if (!['user', 'admin', 'management'].includes(role)) {
      throw new BadRequestException('Invalid role');
    }

    const isAdmin: boolean = role === 'admin';

    let password: string | undefined;
    if (dto.password?.length) {
      password = await bcrypt.hash(dto.password, 10);
    }

    const user = this.userRepository.create({
      email: dto.email,
      name,
      role,
      isAdmin,
      ...(password && { password }),
    });

    const saved = await this.userRepository.save(user);
    return this.sanitize(saved);
  }

  // ==========================
  // GET ALL
  // ==========================
  async findAll() {
    const users = await this.userRepository.find();
    return users.map((u) => this.sanitize(u));
  }

  // ==========================
  // GET ONE
  // ==========================
  async findOne(id: string | ObjectId) {
    const _id = this.toObjectId(id);

    console.log('Finding user with ID:', _id);

    // Use raw query for MongoDB compatibility
    const user = await this.userRepository.findOne({
      where: { _id: _id },
    } as any);

    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  // ==========================
  // FIND BY EMAIL (AUTH)
  // ==========================
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  // ==========================
  // UPDATE ROLE
  // ==========================
  async updateRole(id: string | ObjectId, role: string) {
    if (!['user', 'admin', 'management'].includes(role)) {
      throw new BadRequestException('Invalid role');
    }

    const _id = this.toObjectId(id);

    const user = await this.userRepository.findOne({
      where: { id: _id },
    });

    if (!user) throw new NotFoundException('User not found');

    user.role = role;
    user.isAdmin = role === 'admin';

    const saved = await this.userRepository.save(user);
    return this.sanitize(saved);
  }

  // ==========================
  // UPDATE USER
  // ==========================
  async update(id: string | ObjectId, payload: Partial<CreateUserDto>) {
    const _id = this.toObjectId(id);

    const user = await this.userRepository.findOne({
      where: { id: _id },
    });

    if (!user) throw new NotFoundException('User not found');

    if (payload.password?.length) {
      user.password = await bcrypt.hash(payload.password, 10);
      delete payload.password;
    }

    Object.assign(user, payload);

    const saved = await this.userRepository.save(user);
    return this.sanitize(saved);
  }

  // ==========================
  // DELETE USER
  // ==========================
  async remove(id: string | ObjectId) {
    const _id = this.toObjectId(id);

    const result = await this.userRepository.delete(_id);
    if (!result.affected) {
      throw new NotFoundException('User not found');
    }

    return { success: true };
  }

  // ==========================
  // WISHLIST
  // ==========================
  async getWishlist(userId: string) {
    return this.wishlistRepository.find({ where: { userId } });
  }

  async addToWishlist(userId: string, productId: string) {
    const exists = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });

    if (exists) return exists;

    const wishlist = this.wishlistRepository.create({
      userId,
      productId,
    });

    return this.wishlistRepository.save(wishlist);
  }

  async removeFromWishlist(userId: string, productId: string) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });

    if (!wishlist) return { success: true };

    await this.wishlistRepository.delete(wishlist.id);
    return { success: true };
  }

  // ==========================
  // COMPARE
  // ==========================
  async getCompare(userId: string) {
    return this.compareRepository.find({ where: { userId } });
  }

  async addToCompare(userId: string, productId: string) {
    const exists = await this.compareRepository.findOne({
      where: { userId, productId },
    });

    if (exists) return exists;

    const compare = this.compareRepository.create({
      userId,
      productId,
    });

    return this.compareRepository.save(compare);
  }

  async removeFromCompare(userId: string, productId: string) {
    const compare = await this.compareRepository.findOne({
      where: { userId, productId },
    });

    if (!compare) return { success: true };

    await this.compareRepository.delete(compare.id);
    return { success: true };
  }

  // ==========================
  // ORDERS
  // ==========================
  async getOrders(userId: string) {
    return this.orderRepository.find({
      where: { customer: userId },
      order: { createdAt: 'DESC' },
    });
  }
}
