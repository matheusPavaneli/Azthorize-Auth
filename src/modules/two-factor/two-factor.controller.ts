import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';
import type IPayload from 'src/common/interfaces/IPayload';
import { TwoFactorService } from './two-factor.service';
import TwoFactorDto from './two-factor.dto';
import { CookieInterceptor } from 'src/common/interceptors/cookie.interceptor';
import { Throttle } from '@nestjs/throttler';

@UseInterceptors(CookieInterceptor)
@Controller('2fa')
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get('generate')
  async generate(
    @Req() req: Request,
  ): Promise<{ qrCode: string; message: string }> {
    const { email, sub } = req.user as IPayload;
    const { otpauth_url } = await this.twoFactorService.generateSecret(
      email,
      sub,
    );
    const qrCode = await this.twoFactorService.generateQRCode(otpauth_url);
    return { qrCode, message: 'QR code generated' };
  }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('activate')
  async enable(
    @Req() req: Request,
    @Body() { token }: TwoFactorDto,
  ): Promise<{ message: string }> {
    const { sub: userId } = req.user as IPayload;
    await this.twoFactorService.activateTwoFactor(userId, token);
    return { message: '2FA enabled' };
  }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @Post('verify')
  @UseGuards(JwtAuthGuard)
  async verify(
    @Req() req: Request,
    @Body() { token }: TwoFactorDto,
  ): Promise<{ accessToken: string; message: string }> {
    const { sub: userId, email, twoFactorValidated } = req.user as IPayload;

    if (twoFactorValidated) {
      throw new HttpException(
        'Two factor already validated',
        HttpStatus.CONFLICT,
      );
    }

    const accessToken = await this.twoFactorService.verifyToken(
      userId,
      email,
      token,
    );
    return { accessToken, message: '2FA verified' };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get('disable')
  async disable(@Req() req: Request): Promise<{ message: string }> {
    const { sub: userId } = req.user as IPayload;
    await this.twoFactorService.deactivateTwoFactor(userId);
    return { message: '2FA disabled' };
  }

  @Throttle({ default: { ttl: 120000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get('send-email-token')
  async sendTokenEmail(@Req() req: Request): Promise<{ message: string }> {
    const { email, twoFactorEnabled, sub: userId } = req.user as IPayload;

    if (!twoFactorEnabled)
      throw new HttpException('2FA not enabled', HttpStatus.FORBIDDEN);

    await this.twoFactorService.sendTwoFactorTokenToEmail(email, userId);
    return { message: 'Token sent' };
  }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('verify-email-token')
  async verifyTokenByEmail(
    @Body() { token }: TwoFactorDto,
    @Req() req: Request,
  ): Promise<{ accessToken: string; message: string }> {
    const { sub: userId, twoFactorValidated } = req.user as IPayload;

    if (twoFactorValidated) {
      throw new HttpException(
        'Two factor already validated',
        HttpStatus.CONFLICT,
      );
    }

    const accessToken = await this.twoFactorService.verifyEmailToken(
      userId,
      token,
    );
    return { accessToken, message: '2FA verified' };
  }
}
