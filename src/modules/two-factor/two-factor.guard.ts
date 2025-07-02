import {
  HttpException,
  HttpStatus,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Observable } from 'rxjs';
import type IPayload from 'src/common/interfaces/IPayload';

@Injectable()
export class TwoFactorGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const { twoFactorEnabled, twoFactorValidated } = request.user as IPayload;

    if (twoFactorEnabled && !twoFactorValidated) {
      throw new HttpException(
        '2FA verification required',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return true;
  }
}
