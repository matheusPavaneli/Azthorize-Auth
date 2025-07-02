import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [
    {
      provide: 'JWT_ACCESS_TOKEN_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_ACCESS_SECRET');
        if (!secret) throw new Error('JWT_ACCESS_SECRET not found');

        return new JwtService({
          secret,
          signOptions: { expiresIn: '1d' },
        });
      },
    },
  ],
  exports: ['JWT_ACCESS_TOKEN_SERVICE'],
})
export class JwtAccessModule {}
