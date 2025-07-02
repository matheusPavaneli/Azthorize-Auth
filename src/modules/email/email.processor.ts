/* eslint-disable @typescript-eslint/require-await */
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import type IEmailPayload from 'src/common/interfaces/IEmailPayload';
import { EmailService } from './email.service';

@Processor('emailQueue', {
  lockDuration: 120_000,
  maxStalledCount: 1,
})
export class EmailProcessor extends WorkerHost {
  private readonly logger: Logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { to, subject, text, html } = job.data as IEmailPayload;
    await this.emailService.sendEmail({ to, subject, text, html });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.log(`Job ${job.name} completed`);
  }
}
