import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { CallsGateway } from './calls.gateway';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), JwtModule.register({})],
  controllers: [AuthController],
  providers: [CallsGateway],
})
export class AppModule {}
