import { Module } from '@nestjs/common';
import { TwoFactorService } from './two-factor.service';
import { TwoFactorController } from './two-factor.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { TwoFactorGuard } from './two-factor.guard';
import { CommonModule } from '../common/common.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [AuthModule, UserModule, CommonModule, EmailModule],
  providers: [TwoFactorService, TwoFactorGuard],
  controllers: [TwoFactorController],
})
export class TwoFactorModule {}
