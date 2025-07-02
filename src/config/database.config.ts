import type IDatabaseRootConfig from 'src/common/interfaces/IDatabaseRootConfig';

export default (): IDatabaseRootConfig => ({
  databaseConnection: {
    database: process.env.DB_NAME ?? '',
    host: process.env.DB_HOST ?? '',
    password: process.env.DB_PASS ?? '',
    port: parseInt(process.env.DB_PORT ?? ''),
    username: process.env.DB_USER ?? '',
  },
});
