import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import AuthDto from './auth.dto';
import { CookieInterceptor } from 'src/common/interceptors/cookie.interceptor';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Request } from 'express';
import type IPayload from 'src/common/interfaces/IPayload';
import { Throttle } from '@nestjs/throttler';
import { DeviceService } from '../device/device.service';
import RecoverPasswordDto from './recover-password.dto';
import { ResetPasswordDto } from './reset-password.dto';
import { AuthGuard } from '@nestjs/passport';
import type { User } from '../user/user.entity';

@UseInterceptors(CookieInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly AuthService: AuthService,
    private readonly DeviceService: DeviceService,
  ) {}

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() authDto: AuthDto,
    @Req() req: Request,
  ): Promise<{ accessToken: string; refreshToken: string; message: string }> {
    if (req.cookies.refresh_token || req.cookies.access_token) {
      throw new HttpException('User already logged in', HttpStatus.CONFLICT);
    }

    const { accessToken, refreshToken, user } =
      await this.AuthService.login(authDto);
    await this.DeviceService.verifyDevice(
      user.id,
      authDto.email,
      req.ip as string,
      req.headers['user-agent'] as string,
    );
    return { accessToken, refreshToken, message: 'Login successful' };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout(): { message: string } {
    return { message: 'Logout successful' };
  }

  @Throttle({ default: { ttl: 300000, limit: 10 } })
  @Post('refresh-access-token')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
  ): Promise<{ accessToken: string; message: string }> {
    const refreshToken = req.cookies.refresh_token as string;

    if (!refreshToken)
      throw new HttpException('Refresh token not found', HttpStatus.NOT_FOUND);

    const accessToken = await this.AuthService.refreshAccessToken(refreshToken);
    return { accessToken, message: 'Access token refreshed' };
  }

  @Throttle({ default: { ttl: 120000, limit: 3 } })
  @Post('send-verification-account-email')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async sendVerificationEmail(
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const { email } = req.user as IPayload;
    await this.AuthService.sendVerificationEmail(email);
    return { message: 'Verification email sent' };
  }

  @Throttle({ limit: { ttl: 300000, limit: 10 } })
  @Get('verify-account')
  @HttpCode(HttpStatus.OK)
  async verify(@Query('token') token: string): Promise<{ message: string }> {
    await this.AuthService.verifyEmailToken(token);
    return { message: 'Token verified' };
  }

  @Throttle({ default: { ttl: 300000, limit: 3 } })
  @Post('recover-password')
  @HttpCode(HttpStatus.OK)
  async recoverPassword(
    @Body() { email }: RecoverPasswordDto,
  ): Promise<{ message: string }> {
    await this.AuthService.sendRecoverPasswordByEmail(email);
    return { message: 'If the email exists, an email will be sent' };
  }

  @Throttle({ default: { ttl: 300000, limit: 3 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Query('token') token: string,
    @Body() { newPassword }: ResetPasswordDto,
  ): Promise<{ message: string }> {
    await this.AuthService.resetPassword(token, newPassword);
    return { message: 'Password reset' };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req: Request): {
    accessToken: string;
    refreshToken: string;
    message: string;
  } {
    const { accessToken, refreshToken } = this.AuthService.loginWithProvider(
      req.user as User,
    );
    return { accessToken, refreshToken, message: 'Login successful' };
  }
}
