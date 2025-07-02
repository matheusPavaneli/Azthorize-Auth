import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { BullModule } from '@nestjs/bullmq';
import { EmailProcessor } from './email.processor';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import type INodemailerConfig from 'src/common/interfaces/INodemailerConfig';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'emailQueue',
    }),
  ],
  providers: [
    EmailService,
    EmailProcessor,
    {
      provide: 'NODEMAILER_TRANSPORTER',
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Transporter => {
        const emailConfig =
          configService.get<INodemailerConfig>('nodemailerConfig');

        if (!emailConfig) {
          throw new Error('Email config not found');
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return createTransport({
          ...emailConfig,
          secure: configService.get<string>('NODE_ENV') === 'production',
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          tls: {
            rejectUnauthorized:
              configService.get<string>('NODE_ENV') === 'production',
          },
        });
      },
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
