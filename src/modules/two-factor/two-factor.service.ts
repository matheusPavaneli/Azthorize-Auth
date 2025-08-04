import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import type IPayload from 'src/common/interfaces/IPayload';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EmailService } from '../email/email.service';
import type { User } from '../user/user.entity';

@Injectable()
export class TwoFactorService {
  private readonly logger: Logger = new Logger(TwoFactorService.name);

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly emailService: EmailService,
  ) {}

  generateSecret = async (
    email: string,
    userId: string,
  ): Promise<{ otpauth_url: string }> => {
    const user = await this.userService.findyById(userId);

    if (!user?.isVerified) {
      throw new HttpException('User must be verified', HttpStatus.FORBIDDEN);
    }

    const secret = speakeasy.generateSecret({
      name: `Authenticator ${email}`,
    });

    if (!secret) {
      throw new HttpException(
        "Couldn't generate secret",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.logger.log('Secret generated');
    await this.userService.updateUser(userId, {
      twoFactorSecret: secret.base32,
    });

    return {
      otpauth_url: secret.otpauth_url!,
    };
  };

  generateQRCode = async (otpauth_url: string): Promise<string> => {
    const qrCode = await qrcode.toDataURL(otpauth_url);

    if (!qrCode) {
      throw new HttpException(
        "Couldn't generate QR code",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return qrCode;
  };

  verifyToken = async (userId: string, token: string): Promise<string> => {
    const user = await this.verify2FAUser(userId);
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    const accessToken = this.generateValidAccessToken(user);
    return accessToken;
  };

  public activateTwoFactor = async (
    userId: string,
    token: string,
  ): Promise<string> => {
    const user = await this.verify2FAUser(userId);

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!isValid) {
      this.logger.error('Invalid token');
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    if (user.twoFactorEnabled) {
      throw new HttpException('2FA already enabled', HttpStatus.CONFLICT);
    }

    this.logger.log('Two-factor authentication enabled');
    await this.userService.updateUser(userId, { twoFactorEnabled: true });
    const accessToken = this.generateEnabledTwoFactorAccessToken(user);
    return accessToken;
  };

  public deactivateTwoFactor = async (userId: string): Promise<boolean> => {
    await this.verify2FAUser(userId);
    this.logger.log('Two-factor authentication disabled');
    await this.userService.updateUser(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    });
    return true;
  };

  public sendTwoFactorTokenToEmail = async (
    email: string,
    userId: string,
  ): Promise<string> => {
    const token = this.generateSixDigitToken();
    await this.cacheManager.set(`2fa-email:${userId}`, token);
    await this.sendEmailWithToken(email, token);
    return token;
  };

  public verifyEmailToken = async (
    userId: string,
    token: string,
  ): Promise<string> => {
    const user = await this.verify2FAUser(userId);

    const cachedToken = await this.cacheManager.get(`2fa-email:${userId}`);
    if (cachedToken !== token) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    const accessToken = this.generateValidAccessToken(user);
    await this.cacheManager.del(`2fa-email:${userId}`);
    return accessToken;
  };

  private generateSixDigitToken = (): string => {
    const token: string = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    return token;
  };

  private sendEmailWithToken = async (email: string, token: string) => {
    await this.emailService.addEmailToQueue({
      to: email,
      subject: 'Two-factor authentication token',
      text: `Your token is ${token}`,
    });
  };

  private verify2FAUser = async (userId: string): Promise<User> => {
    const user = await this.userService.findyById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (!user.twoFactorSecret) {
      throw new HttpException(
        'Two-factor authentication is not enabled for this user',
        HttpStatus.CONFLICT,
      );
    }

    return user;
  };

  private generateValidAccessToken = (user: User): string => {
    const payload: Partial<IPayload> = {
      sub: user.id,
      email: user.email,
      username: user.username,
      twoFactorValidated: true,
      twoFactorEnabled: user.twoFactorEnabled,
    };

    const accessToken = this.authService.createAccessToken(payload);
    return accessToken;
  };

  public generateEnabledTwoFactorAccessToken = (user: User): string => {
    const payload: Partial<IPayload> = {
      sub: user.id,
      email: user.email,
      username: user.username,
      twoFactorValidated: false,
      twoFactorEnabled: true,
    };

    const accessToken = this.authService.createAccessToken(payload);
    return accessToken;
  };
}
