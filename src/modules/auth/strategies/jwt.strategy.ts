/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CryptoHelper } from 'src/common/helpers/crypto.helper';
import type IPayload from 'src/common/interfaces/IPayload';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger: Logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly aesService: CryptoHelper,
    private readonly userService: UserService,
  ) {
    const secretOrKey = configService.get<string>('JWT_ACCESS_SECRET') || '';
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string => {
          const token = (request.cookies as { [key: string]: string })
            ?.access_token;

          if (!token) this.logger.error('Access token not found');

          return token ?? '';
        },
      ]),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  validate(payload: IPayload): IPayload {
    this.logger.log("User's payload: ", payload);
    return payload;
  }
}
