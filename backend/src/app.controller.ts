import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { RequestWithUser } from './auth/jwt-cookie.guard';

import { JwtCookieGuard } from './auth/jwt-cookie.guard';

@Controller('api')
export class AppController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      now: new Date().toISOString(),
      uptimeSec: Math.round(process.uptime()),
      env: process.env.NODE_ENV ?? 'development',
    };
  }

  @UseGuards(JwtCookieGuard)
  @Get('me')
  me(@Req() req: RequestWithUser) {
    return { user: req.user };
  }
}
