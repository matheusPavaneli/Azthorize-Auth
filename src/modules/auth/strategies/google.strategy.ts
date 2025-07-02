import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-google-oauth20';
import type { VerifiedCallback } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { IProvider } from 'src/modules/user/user.entity';
import type IGoogleStrategyConfig from 'src/common/interfaces/IGoogleStrategyConfig';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    @Inject('GOOGLE_STRATEGY') googleStrategyConfig: IGoogleStrategyConfig,
  ) {
    super({ ...googleStrategyConfig, passReqToCallback: true });
  }

  async validate(
    _req: Request,
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifiedCallback,
  ): Promise<void> {
    const { name, emails } = profile;
    const user = await this.authService.validateOAuthLogin(
      IProvider.GOOGLE,
      emails![0].value,
      `${name?.givenName} ${name?.familyName}`,
    );
    return done(null, user);
  }
}
