import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { Transporter } from 'nodemailer';
import type IEmailPayload from 'src/common/interfaces/IEmailPayload';

@Injectable()
export class EmailService {
  private readonly logger: Logger = new Logger(EmailService.name);

  constructor(
    @InjectQueue('emailQueue') private emailQueue: Queue,
    @Inject('NODEMAILER_TRANSPORTER') private readonly transporter: Transporter,
    private readonly configService: ConfigService,
  ) {}

  public addEmailToQueue = async (data: IEmailPayload): Promise<void> => {
    this.logger.log(`Added job to send email to ${data.to}`);
    await this.emailQueue.add('sendEmail', data, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 10000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  };

  public sendEmail = async (data: IEmailPayload): Promise<void> => {
    this.logger.log(`Sending email to ${data.to}`);
    await this.transporter.sendMail({
      ...data,
      from: this.configService.get('SMTP_FROM') || '',
    });
    this.logger.log(`Email sent to ${data.to}`);
  };
}
