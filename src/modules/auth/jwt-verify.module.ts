import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [
    {
      provide: 'JWT_VERIFY_TOKEN_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_VERIFY_SECRET');
        if (!secret) throw new Error('JWT_VERIFY_SECRET not found');

        return new JwtService({
          secret,
          signOptions: { expiresIn: '5m' },
        });
      },
    },
  ],
  exports: ['JWT_VERIFY_TOKEN_SERVICE'],
})
export class JwtVerifyModule {}
