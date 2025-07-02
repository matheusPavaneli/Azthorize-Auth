import type IGoogleStrategyConfigRoot from 'src/common/interfaces/IGoogleStrategyConfigRoot';

export default (): IGoogleStrategyConfigRoot => ({
  googleStrategyConfig: {
    clientID: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL ?? '',
    scope: ['email', 'profile'],
  },
});
