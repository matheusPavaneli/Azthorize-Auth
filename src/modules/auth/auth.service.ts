import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import type AuthDto from './auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import type IPayload from 'src/common/interfaces/IPayload';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import type { IProvider, User } from '../user/user.entity';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);
  private readonly MAX_ATTEMPS: number = 3;
  constructor(
    private readonly userService: UserService,
    @Inject('JWT_ACCESS_TOKEN_SERVICE')
    private readonly jwtAccessService: JwtService,
    @Inject('JWT_REFRESH_TOKEN_SERVICE')
    private readonly jwtRefreshService: JwtService,
    @Inject('JWT_VERIFY_TOKEN_SERVICE')
    private readonly jwtVerifyService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  login = async ({
    email,
    password,
  }: AuthDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: User;
  }> => {
    const user = await this.userService.findByEmail(email);
    const isPasswordValid = await user?.comparePassword(password);

    if (!user || !isPasswordValid) {
      this.logger.error(`Invalid credentials for user with email ${email}`);
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const payload: Partial<IPayload> = {
      sub: user.id,
      email,
      username: user.username,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorValidated: !user.twoFactorEnabled,
    };

    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);

    this.logger.log(
      `Successfully logged, with tokens: ${accessToken}, ${refreshToken}`,
    );
    return { accessToken, refreshToken, user };
  };

  public sendVerificationEmail = async (email: string): Promise<void> => {
    const token = this.createTokenByEmail(email);
    const url = this.generateValidationEmailUrl(token);
    await this.emailService.addEmailToQueue({
      to: email,
      subject: 'Verify',
      text: url,
    });
  };

  public createAccessToken = (payload: Partial<IPayload>): string => {
    return this.jwtAccessService.sign(payload);
  };

  private createRefreshToken = (payload: Partial<IPayload>): string => {
    return this.jwtRefreshService.sign(payload);
  };

  private generateValidationEmailUrl = (token: string): string => {
    const validateEmailUrl = this.configService.get<string>(
      'FRONTEND_VALIDATE_EMAIL_URL',
    );

    if (!validateEmailUrl) {
      throw new Error('FRONTEND_VALIDATE_EMAIL_URL not found');
    }

    return `${validateEmailUrl}?token=${token}`;
  };

  private createTokenByEmail = (email: string): string => {
    return this.jwtVerifyService.sign({ email });
  };

  public verifyEmailToken = async (token: string): Promise<string> => {
    try {
      const { email }: { email: string } =
        await this.jwtVerifyService.verify(token);
      await this.userService.verifyUser(email);
      return email;
    } catch {
      this.logger.error('Invalid verify email token');
      throw new HttpException(
        'Invalid verify email token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  };

  public refreshAccessToken = async (refreshToken: string): Promise<string> => {
    try {
      const payloadWithExp: IPayload =
        await this.jwtRefreshService.verify(refreshToken);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { exp, iat, ...payload } = payloadWithExp;
      const accessToken: string = this.createAccessToken(payload);
      this.logger.log(`Refreshed access token: ${accessToken}`);
      return accessToken;
    } catch {
      this.logger.error('Invalid refresh token');
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }
  };

  public sendRecoverPasswordByEmail = async (email: string): Promise<void> => {
    const token = this.createTokenByEmail(email);
    const url = this.generateRecoverPasswordUrl(token);
    await this.emailService.addEmailToQueue({
      to: email,
      subject: 'Recover password',
      text: url,
    });
  };

  private generateRecoverPasswordUrl = (token: string): string => {
    const recoverPasswordUrl = this.configService.get<string>(
      'FRONTEND_RECOVER_PASSWORD_URL',
    );

    if (!recoverPasswordUrl) {
      throw new Error('FRONTEND_RECOVER_PASSWORD_URL not found');
    }

    return `${recoverPasswordUrl}?token=${token}`;
  };

  private getEmailByRecoverPasswordToken = async (
    token: string,
  ): Promise<string> => {
    try {
      const { email }: { email: string } =
        await this.jwtVerifyService.verify(token);
      console.log(email);
      return email;
    } catch {
      this.logger.error('Invalid recover password token');
      throw new HttpException(
        'Invalid recover password token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  };

  public resetPassword = async (
    token: string,
    password: string,
  ): Promise<void> => {
    const email = await this.getEmailByRecoverPasswordToken(token);
    await this.userService.resetPassword(email, password);
  };

  public loginWithProvider = (
    user: User,
  ): { accessToken: string; refreshToken: string } => {
    const payload: Partial<IPayload> = {
      sub: user.id,
      email: user.email,
      username: user.username,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorValidated: false,
    };
    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);
    return { accessToken, refreshToken };
  };

  public validateOAuthLogin = async (
    provider: IProvider,
    email: string,
    name: string,
  ): Promise<User> => {
    let user = await this.userService.getUserByProviderAndEmail(
      provider,
      email,
    );

    if (!user) {
      user = await this.userService.create({ email, name, provider });
      this.logger.log(`User created with provider ${provider}`);
    }

    this.logger.log(`User found with provider ${provider}`);
    return user;
  };
}
