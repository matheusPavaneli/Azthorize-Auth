import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import DatabaseConfig from './config/database.config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import type IDatabaseConfig from './common/interfaces/IDatabaseConfig';
import { BullModule } from '@nestjs/bullmq';
import BullmqConfig from './config/redis.config';
import NodemailerConfig from './config/nodemailer.config';
import type IRedisConfig from './common/interfaces/IRedisConfig';
import { CacheModule, type CacheModuleOptions } from '@nestjs/cache-manager';
import { TwoFactorModule } from './modules/two-factor/two-factor.module';
import * as redisStore from 'cache-manager-redis-store';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { APP_GUARD } from '@nestjs/core';
import GoogleStrategyConfig from './config/google.strategy.config';
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        DatabaseConfig,
        BullmqConfig,
        NodemailerConfig,
        GoogleStrategyConfig,
      ],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configService: ConfigService): { connection: IRedisConfig } {
        const redisConfig = configService.get('redisConfig') as IRedisConfig;

        if (!redisConfig) {
          throw new Error('Redis config not found');
        }

        return { connection: redisConfig };
      },
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const databaseConfig = configService.get(
          'databaseConnection',
        ) as IDatabaseConfig;

        if (!databaseConfig) {
          throw new Error('Database config not found');
        }

        return {
          ...databaseConfig,
          type: 'postgres',
          synchronize: true,
          autoLoadEntities: true,
          connectTimeoutMS: 5000,
          retryAttempts: 3,
        };
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): CacheModuleOptions => {
        const redisConfig = configService.get('redisConfig') as IRedisConfig;

        if (!redisConfig) {
          throw new Error('Redis config not found');
        }

        return {
          ...redisConfig,
          store: redisStore,
        };
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.get('redisConfig') as IRedisConfig;

        if (!redisConfig) {
          throw new Error('Redis config not found');
        }

        return {
          throttlers: [{ ttl: 20000, limit: 2 }],
          storage: new ThrottlerStorageRedisService({ ...redisConfig }),
        };
      },
    }),
    UserModule,
    AuthModule,
    TwoFactorModule,
  ],
})
export class AppModule {}
