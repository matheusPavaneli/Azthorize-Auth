import type IRedisRootConfig from 'src/common/interfaces/IRedisRootConfig';

export default (): IRedisRootConfig => ({
  redisConfig: {
    host: process.env.REDIS_HOST ?? '',
    port: parseInt(process.env.REDIS_PORT ?? ''),
  },
});
