import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtAccessModule } from './jwt-access.module';
import { JwtRefreshModule } from './jwt-refresh.module';
import { JwtVerifyModule } from './jwt-verify.module';
import { EmailModule } from '../email/email.module';
import { CommonModule } from '../common/common.module';
import { DeviceModule } from '../device/device.module';
import { ConfigService } from '@nestjs/config';
import type IGoogleStrategyConfig from 'src/common/interfaces/IGoogleStrategyConfig';
import { GoogleStrategy } from './strategies/google.strategy';
@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtAccessModule,
    JwtRefreshModule,
    JwtVerifyModule,
    EmailModule,
    CommonModule,
    DeviceModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    JwtAuthGuard,
    {
      provide: 'GOOGLE_STRATEGY',
      inject: [ConfigService],
      useFactory: (configService: ConfigService): IGoogleStrategyConfig => {
        const googleStrategyConfig = configService.get<IGoogleStrategyConfig>(
          'googleStrategyConfig',
        );

        if (!googleStrategyConfig) {
          throw new Error('Google strategy config not found');
        }

        return googleStrategyConfig;
      },
    },
  ],
  exports: [JwtAuthGuard, AuthService],
})
export class AuthModule {}
