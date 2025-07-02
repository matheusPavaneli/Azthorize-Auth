import { Module } from '@nestjs/common';
import { CryptoHelper } from 'src/common/helpers/crypto.helper';

@Module({
  providers: [CryptoHelper],
  exports: [CryptoHelper],
})
export class CommonModule {}
