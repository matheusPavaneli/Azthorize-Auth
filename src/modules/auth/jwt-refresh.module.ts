import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [
    {
      provide: 'JWT_REFRESH_TOKEN_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_REFRESH_SECRET');
        if (!secret) throw new Error('JWT_REFRESH_SECRET not found');

        return new JwtService({
          secret,
          signOptions: { expiresIn: '7d' },
        });
      },
    },
  ],
  exports: ['JWT_REFRESH_TOKEN_SERVICE'],
})
export class JwtRefreshModule {}
