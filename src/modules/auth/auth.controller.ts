import { Body, Controller, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SocialLoginDto } from './dto/social-login.dto';

@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
  @Post('decode/:token')
  @ApiOperation({ summary: 'Decode and verify a JWT auth code (token)' })
  async decode(@Param('token') token: string) {
    return this.authService.decodeAuthCode(token);
  }

  @Post('admin-register')
  @ApiOperation({ summary: 'Register a new admin user' })
  async adminRegister(@Body() dto: RegisterDto) {
    return this.authService.adminRegister(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto) {
    return this.authService.loginWithCredentials(dto.email, dto.password);
  }

  @Post('social-login')
  @ApiOperation({ summary: 'Login with social provider (Google/Facebook)' })
  async socialLogin(@Body() dto: SocialLoginDto) {
    return this.authService.socialLogin(dto);
  }
  
}
