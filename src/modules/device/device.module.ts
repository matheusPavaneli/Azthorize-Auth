import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { DeviceService } from './device.service';

@Module({
  imports: [EmailModule],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}
