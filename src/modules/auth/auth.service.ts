import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { Repository, DeepPartial } from 'typeorm';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  image?: string | null;
}
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  async decodeAuthCode(token: string): Promise<any> {
    try {
      // This both verifies and decodes the token
      return this.jwtService.verify(token);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user: DeepPartial<User> = {
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      role: 'user',
      isAdmin: false,
    };
    const savedUser = await this.userRepo.save(this.userRepo.create(user));

    return this.login({
      id: savedUser.id?.toString?.() ?? String(savedUser.id),
      email: savedUser.email,
      name: savedUser.name,
      role: savedUser.role,
      image: savedUser.image ?? undefined,
    });
  }

  async adminRegister(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Admin with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user: DeepPartial<User> = {
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      role: dto.role || 'admin',
      isAdmin: true,
    };
    const savedUser = await this.userRepo.save(this.userRepo.create(user));
    return this.login({
      id: savedUser.id?.toString?.() ?? String(savedUser.id),
      email: savedUser.email,
      name: savedUser.name,
      role: savedUser.role,
      image: savedUser.image ?? undefined,
    });
  }


  async validateUser(email: string, plainPassword: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return null;
    if (!user.password) return null;
    const matches = await bcrypt.compare(plainPassword, user.password);
    if (!matches) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest;
  }

  async login(user: AuthUser) {
    const id = user.id?.toString?.() ?? String(user.id);
    const payload = { sub: id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      },
    };
  }

  async loginWithCredentials(email: string, password: string) {
    const valid = await this.validateUser(email, password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return this.login({ ...valid, id: valid.id?.toString?.() ?? String(valid.id) });
  }

  async socialLogin(dto: SocialLoginDto) {
    let user = await this.userRepo.findOne({ where: { email: dto.email } });

    if (!user) {
      const newUser: DeepPartial<User> = {
        email: dto.email,
        name: dto.name,
        image: dto.avatar ?? undefined,
        role: 'user',
        isAdmin: false,
      };
      user = await this.userRepo.save(this.userRepo.create(newUser));
    }

    if (!user) throw new UnauthorizedException('User creation failed');

    const authUser: AuthUser = {
      id: user.id?.toString?.() ?? String(user.id),
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image ?? undefined,
    };
    return this.login(authUser);
  }
}
