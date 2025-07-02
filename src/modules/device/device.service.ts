/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { UAParser, IResult } from 'ua-parser-js';
import type IEmailPayload from 'src/common/interfaces/IEmailPayload';
import { EmailService } from '../email/email.service';

@Injectable()
export class DeviceService {
  private readonly logger: Logger = new Logger(DeviceService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly emailService: EmailService,
  ) {}

  public verifyDevice = async (
    userId: string,
    email: string,
    ip: string,
    userAgent: string,
  ) => {
    const deviceFingerprint = this.getDeviceFingerprint(ip, userAgent);
    this.logger.log(`Device fingerprint: ${deviceFingerprint}`);
    const userDevice = await this.getUserDevice(userId);
    this.logger.log(`User device: ${userDevice}`);

    if (userDevice !== deviceFingerprint && userDevice) {
      const { os, browser, device, platform } = this.parseUserAgent(userAgent);

      const payload: IEmailPayload = {
        to: email,
        subject: 'New device detected',
        text: `Hello,
      
      We noticed a login from a new device on your account:
      
      - Device: ${device}
      - Platform: ${platform}
      - Browser: ${browser}
      - Operating System: ${os}
      - IP Address: ${ip}
      - Date/Time: ${new Date().toLocaleString()}
      
      If this was you, no further action is needed.
      If you do not recognize this activity, please secure your account immediately.
      
      Best regards,
      Your Security Team`,
      };
      await this.sendDeviceDetailsEmail(payload);
      this.logger.log('New device detected');
    }
    await this.cacheManager.set(userId, deviceFingerprint);
  };

  private getUserDevice = async (userId: string): Promise<string | undefined> =>
    await this.cacheManager.get(userId);

  private getDeviceFingerprint = (ip: string, userAgent: string): string =>
    `${ip}_${userAgent}`;

  private parseUserAgent = (
    userAgent: string,
  ): { os: string; browser: string; device: string; platform: string } => {
    const parser: UAParser = new UAParser(userAgent);
    const result: IResult = parser.getResult();

    return {
      os: result.os.name ?? 'Unknown',
      browser: result.browser.name ?? 'Unknown',
      device: result.device.type ?? 'Unknown',
      platform: result.device.vendor ?? 'Unknown',
    };
  };

  private async sendDeviceDetailsEmail(data: IEmailPayload): Promise<void> {
    await this.emailService.addEmailToQueue(data);
  }
}
