import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

const ROOM_SECRET = process.env.ROOM_SECRET!;

function timingEq(a: string, b: string) {
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function verifyToken(token: string) {
  const parts = token.split('_');
  if (parts.length !== 3) throw new UnauthorizedException('Bad token');

  const [rid, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!exp || exp < Math.floor(Date.now() / 1000)) {
    throw new UnauthorizedException('Token expired');
  }
  const body = `${rid}_${exp}`;
  const calc = crypto
    .createHmac('sha256', ROOM_SECRET)
    .update(body)
    .digest('base64url');
  if (!timingEq(sig, calc)) throw new UnauthorizedException('Bad signature');

  return { roomId: rid };
}

@Controller('api/rooms')
export class RoomsController {
  @Post('resolve')
  resolve(@Body() { token }: { token: string }) {
    const { roomId } = verifyToken(token);
    return {
      roomId,
      iceServers: [
        { urls: ['stun:durev.ru:3478'] },
        {
          urls: [
            'turn:durev.ru:3478?transport=udp',
            'turn:durev.ru:3478?transport=tcp',
          ],
          username: 'webrtc',
          credential: 'webrtcStrongPass',
        },
      ],
      jwt: null, // если ты используешь jwt для socket.io — подставь
    };
  }
}
