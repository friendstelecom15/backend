import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  email: string;
  role?: string; // Use string, not string[]
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'change_me',
    });
  }

  validate(payload: JwtPayload): {
    id: string;
    _id: string;
    sub: string;
    email: string;
    role?: string;
  } {
    // Log the payload for debugging
    console.log('JWT payload:', payload);
    // Just return the role as-is (string)
    return { id: payload.sub, _id: payload.sub, sub: payload.sub, email: payload.email, role: payload.role };
  }
}