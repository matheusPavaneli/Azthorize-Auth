import type INodemailerRootConfig from 'src/common/interfaces/INodemailerRootConfig';

export default (): INodemailerRootConfig => ({
  nodemailerConfig: {
    host: process.env.SMTP_HOST ?? '',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
    auth: {
      user: process.env.SMTP_USER ?? '',
      pass: process.env.SMTP_PASS ?? '',
    },
  },
});
