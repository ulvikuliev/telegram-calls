import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user?: unknown;
}

@Injectable()
export class JwtCookieGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private cfg: ConfigService,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = req.headers.authorization;
    const bearer =
      typeof authHeader === 'string'
        ? authHeader.replace(/^Bearer\s+/i, '')
        : undefined;
    const cookies = req.cookies as Record<string, string> | undefined;
    const token = cookies?.tma || bearer;

    if (!token) throw new UnauthorizedException('No token');

    try {
      const jwtSecret = this.cfg.getOrThrow<string>('JWT_SECRET');
      const payload = this.jwt.verify(token, {
        secret: jwtSecret,
      }) as unknown;

      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Bad/expired token');
    }
  }
}
