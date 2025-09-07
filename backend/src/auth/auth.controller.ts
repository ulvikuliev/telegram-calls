import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { validateInitData } from './telegram-validate';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('api/auth')
export class AuthController {
  constructor(
    private jwt: JwtService,
    private cfg: ConfigService,
  ) {}

  @Post('telegram')
  async telegram(@Body() dto: TelegramAuthDto, @Res() res: Response) {
    const botToken = this.cfg.getOrThrow<string>('BOT_TOKEN');
    const { user, fields } = validateInitData(dto.initData, botToken, 600);
    const telegramUser = user as { id?: number; username?: string } | undefined;

    const payload = {
      sub: telegramUser?.id ?? null,
      username: telegramUser?.username ?? null,
      auth_date: Number(fields.auth_date),
    };

    const token = await this.jwt.signAsync(payload, {
      secret: this.cfg.getOrThrow<string>('JWT_SECRET'),
      expiresIn: '7d',
    });

    res.cookie('tma', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 3600 * 1000,
    });

    return res.json({ user: telegramUser, ok: true });
  }
}
